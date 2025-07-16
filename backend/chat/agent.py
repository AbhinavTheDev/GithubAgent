import os
import base64

# import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from dotenv import load_dotenv
import json

# Core libraries
from github import Github
from fastembed import TextEmbedding
import chromadb
from groq import Groq

# Agno components
from agno.agent import Agent
from agno.models.groq import Groq as AgnoGroq
from agno.vectordb.chroma import ChromaDb
from agno.embedder.fastembed import FastEmbedEmbedder
from agno.knowledge import AgentKnowledge

from db.repo_db import RepositoryDataManager
from core.config import settings


@dataclass
class CodeSummary:
    file_path: str
    content: str
    summary: str
    functions: List[Dict[str, Any]]
    classes: List[Dict[str, Any]]
    metadata: Dict[str, Any]


class GitHubRepoAssistant:
    def __init__(
        self,
        github_token: Optional[str] = None,
        groq_api_key: Optional[str] = None,
        chroma_path: str = settings.chroma_db_path,
        repo_db_path: str = settings.repo_db_path,
    ):
        load_dotenv()

        # Initialize APIs
        self.github = Github(github_token or settings.GITHUB_TOKEN)
        self.groq_client = Groq(api_key=groq_api_key or settings.GROQ_API_KEY)

        # Initialize embedder
        self.embedder = FastEmbedEmbedder()
        self.chroma_path = chroma_path

        # Initialize repository manager
        self.repo_manager = RepositoryDataManager(repo_db_path)

        # Store vector databases for different repositories
        self.vector_dbs: Dict[int, ChromaDb] = {}
        self.knowledge_bases: Dict[int, AgentKnowledge] = {}
        self.agents: Dict[int, Agent] = {}

        self.repo_summaries: Dict[int, List[CodeSummary]] = {}

        # Initialize vector database

    def get_or_create_vector_db(self, repo_id: int, collection_name: str) -> ChromaDb:
        if repo_id not in self.vector_dbs:
            self.vector_dbs[repo_id] = ChromaDb(
                collection=collection_name,
                path=self.chroma_path,
                persistent_client=True,
                embedder=self.embedder,
            )
        return self.vector_dbs[repo_id]

    # Initialize Knowledge Base
    def get_or_create_knowledge_base(
        self, repo_id: int, vector_db: ChromaDb
    ) -> AgentKnowledge:
        if repo_id not in self.knowledge_bases:
            self.knowledge_bases[repo_id] = AgentKnowledge(vector_db=vector_db)
        return self.knowledge_bases[repo_id]

    # Initialize agent
    def get_or_create_agent(
        self, repo_id: int, knowledge_base: AgentKnowledge
    ) -> Agent:
        if repo_id not in self.agents:
            self.agents[repo_id] = Agent(
                model=AgnoGroq(id=settings.GROQ_CHAT_MODEL_ID),
                knowledge=knowledge_base,
                search_knowledge=True,
                show_tool_calls=True,
                instructions=[
                    "You are a GitHub repository assistant that can answer questions about code repositories.",
                    "Use the knowledge base to find relevant code summaries, functions, and classes.",
                    "Provide detailed explanations about code structure, functionality, and relationships.",
                    "When explaining code, include file paths and specific function/class names when relevant.",
                ],
            )
        return self.agents[repo_id]

    def delete_repository(self, repo_id: int) -> bool:
        """
        Delete a repository from the database and its associated vector collection.
        """
        repo_data = self.repo_manager.get_repository(repo_id)
        if not repo_data:
            return False  # Repository doesn't exist

        _, collection_name = repo_data

        # Delete from DB
        db_deleted = self.repo_manager.delete_repository(repo_id)
        if not db_deleted:
            return False

        # Delete ChromaDB collection
        try:
            # Get a client instance to delete the collection
            chroma_client = chromadb.PersistentClient(path=self.chroma_path)
            chroma_client.delete_collection(name=collection_name)
            print(f"Successfully deleted collection: {collection_name}")
        except Exception as e:
            print(
                f"Could not delete collection '{collection_name}'. It may not exist. Error: {e}"
            )
            # Continue even if collection deletion fails, as DB entry is main record

        # Clear from memory
        self.vector_dbs.pop(repo_id)
        self.knowledge_bases.pop(repo_id)
        self.agents.pop(repo_id)
        self.repo_summaries.pop(repo_id)

        return True

    def fetch_repo_files(
        self, repo_url: str, file_extensions: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch all files from a GitHub repository using PyGithub
        """
        if file_extensions is None:
            file_extensions = settings.file_extenions

        # Extract owner and repo name from URL
        parts = repo_url.replace("https://github.com/", "").split("/")
        owner, repo_name = parts[0], parts[1]

        repo = self.github.get_repo(f"{owner}/{repo_name}")
        files = []

        def get_files_recursive(contents):
            for content in contents:
                if content.type == "dir":
                    get_files_recursive(repo.get_contents(content.path))
                else:
                    file_ext = Path(content.path).suffix
                    if file_ext in file_extensions:
                        try:
                            # Decode file content
                            file_content = base64.b64decode(content.content).decode(
                                "utf-8"
                            )
                            files.append(
                                {
                                    "path": content.path,
                                    "content": file_content,
                                    "size": content.size,
                                    "url": content.html_url,
                                }
                            )
                        except Exception as e:
                            print(f"Error reading file {content.path}: {e}")

        get_files_recursive(repo.get_contents(""))
        return files

    def extract_code_elements(
        self, file_content: str, file_path: str
    ) -> Dict[str, Any]:
        """
        Extract functions and classes from code using simple parsing
        """
        functions = []
        classes = []

        lines = file_content.split("\n")
        # current_function = None
        # current_class = None

        for i, line in enumerate(lines):
            stripped = line.strip()

            # Extract Python functions
            if stripped.startswith("def "):
                func_name = stripped.split("(")[0].replace("def ", "")
                functions.append(
                    {
                        "name": func_name,
                        "line": i + 1,
                        "signature": stripped,
                        "file_path": file_path,
                    }
                )

            # Extract Python classes
            elif stripped.startswith("class "):
                class_name = (
                    stripped.split("(")[0].replace("class ", "").replace(":", "")
                )
                classes.append(
                    {
                        "name": class_name,
                        "line": i + 1,
                        "signature": stripped,
                        "file_path": file_path,
                    }
                )

        return {"functions": functions, "classes": classes}

    def summarize_with_llm(
        self, file_content: str, file_path: str, code_elements: Dict[str, Any]
    ) -> str:
        """
        Generate summary using Groq LLM
        """
        prompt = f"""
        Analyze this code file and provide a comprehensive summary:
        
        File: {file_path}
        
        Functions found: {[f["name"] for f in code_elements["functions"]]}
        Classes found: {[c["name"] for c in code_elements["classes"]]}
        
        Code:
        ```
        {file_content[:2000]}  # Truncate for API limits
        ```
        
        Please provide:
        1. A brief description of what this file does
        2. Key functions and their purposes
        3. Key classes and their purposes
        4. Dependencies and imports
        5. Overall architecture/design patterns used
        
        Keep the summary concise but informative.
        """

        try:
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_Summarizer_MODEL_ID,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.3,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating summary for {file_path}: {e}")
            return f"File: {file_path}\nContent preview: {file_content[:200]}..."

    def fetch_github_metadata(self, repo_url: str):
        # Extract owner/repo from URL
        parts = repo_url.rstrip("/").split("/")
        owner, repo_name = parts[-2], parts[-1]
        repo = self.github.get_repo(f"{owner}/{repo_name}")

        # Get last commit on default branch
        branch = repo.default_branch
        commits = repo.get_commits(sha=branch)
        last_commits = []
        for i in range(min(3, commits.totalCount)):
            commit = commits[i]
            last_commits.append(
                {
                    "sha": commit.sha,
                    "message": commit.commit.message,
                    "author": commit.commit.author.name,
                    "date": commit.commit.author.date.isoformat(),
                    "url": commit.html_url,
                }
            )
        last_activity = json.dumps(last_commits) if last_commits else None

        return {
            "name": repo.name,
            "description": repo.description,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "issues": repo.open_issues_count,
            "license": repo.license.spdx_id if repo.license else None,
            "owner": owner,
            "last_activity": last_activity,
        }

    def process_repository(self, repo_url: str) -> Tuple[bool, int]:
        """
        Main workflow: GitHub Repo → Store URLs in db with ID → Parse Code → Summarize → Store in VectorDB
        """
        try:
            print(f"=============Processing repository: {repo_url}")

            # Add repository to database
            repo_id = self.repo_manager.add_repository(repo_url)

            # Add Repo MetaData in DB
            print(f"=============fetching repository metadata: {repo_url}")
            metadata = self.fetch_github_metadata(repo_url)
            self.repo_manager.update_repository_metadata(repo_id, metadata)

            # Get Repo ID
            repo_data = self.repo_manager.get_repository(repo_id)

            if not repo_data:
                return False, -1

            _, collection_name = repo_data

            print(
                f"=============Added repository in db with col name and ID: {collection_name}, {repo_id}"
            )

            # Create vector DB and knowledge base for this repository
            vector_db = self.get_or_create_vector_db(repo_id, collection_name)
            knowledge_base = self.get_or_create_knowledge_base(repo_id, vector_db)

            # Initialize repo summaries for this repository
            if repo_id not in self.repo_summaries:
                self.repo_summaries[repo_id] = []

            # Step 1: Fetch repository files
            print("=============Fetching repository files...")
            files = self.fetch_repo_files(repo_url)
            print(f"=============Found {len(files)} code files")

            # Step 2-4: Parse, summarize, and prepare for vector storage
            print("=============Processing files...")
            documents = []

            for file_data in files:
                file_path = file_data["path"]
                file_content = file_data["content"]

                print(f"=============Processing: {file_path}")

                # Extract code elements directly
                code_elements = self.extract_code_elements(file_content, file_path)

                # Generate summary with LLM
                summary = self.summarize_with_llm(
                    file_content, file_path, code_elements
                )

                # Create code summary object
                code_summary = CodeSummary(
                    file_path=file_path,
                    content=file_content,
                    summary=summary,
                    functions=code_elements["functions"],
                    classes=code_elements["classes"],
                    metadata={
                        "repo_url": repo_url,
                        "repo_id": repo_id,
                        "file_size": file_data["size"],
                        "file_url": file_data["url"],
                    },
                )

                self.repo_summaries[repo_id].append(code_summary)

                # Prepare document for vector storage
                document_text = f"""
                File: {file_path}
            
                Summary: {summary}
            
                Functions: {", ".join([f["name"] for f in code_elements["functions"]])}
                Classes: {", ".join([c["name"] for c in code_elements["classes"]])}
            
                Content Preview:
                {file_content[:500]}
                """

                documents.append(
                    {
                        "content": document_text,
                        "metadata": {
                            "file_path": file_path,
                            "repo_url": repo_url,
                            "repo_id": repo_id,
                            "type": "code_file",
                        },
                    }
                )

            # Step 5: Store in Vector Database
            print("================Storing in vector database...")

            if documents:
                for doc in documents:
                    knowledge_base.load_text(
                        text=doc["content"],
                        filters=doc["metadata"],
                    )
            print(
                f"================Successfully processed {len(files)} files from {repo_url}"
            )

            return True, repo_id
        except Exception as e:
            print(f"Error Occured in Repository Processing {e}")
            return False, -1

    def query_repository(self, repo_id: int, question: str) -> str:
        """
        Query the repository using the agent
        """
        repo_data = self.repo_manager.get_repository(repo_id)
        if not repo_data:
            return "Repository not found."

        # Ensure components are loaded for the repo
        _, collection_name = repo_data
        vector_db = self.get_or_create_vector_db(repo_id, collection_name)
        knowledge_base = self.get_or_create_knowledge_base(repo_id, vector_db)
        agent = self.get_or_create_agent(repo_id, knowledge_base)

        return agent.run(question).content

    def get_file_summary(self, repo_id: int, file_path: str) -> Optional[CodeSummary]:
        """
        Get summary for a specific file
        """
        for summary in self.repo_summaries.get(repo_id, []):
            if summary.file_path == file_path:
                return summary
        return None

    def list_functions(
        self, repo_id: int, file_path: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List all functions, optionally filtered by file
        """
        functions = []
        for summary in self.repo_summaries.get(repo_id, []):
            if file_path is None or summary.file_path == file_path:
                functions.extend(summary.functions)
        return functions

    def list_classes(
        self, repo_id: int, file_path: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List all classes, optionally filtered by file
        """
        classes = []
        for summary in self.repo_summaries.get(repo_id, []):
            if file_path is None or summary.file_path == file_path:
                classes.extend(summary.classes)
        return classes


# # Usage Example

# def main():
#     # Initialize the assistant
#     assistant = GitHubRepoAssistant()

#     # Process a repository
#     # repo_url = "https://github.com/Insharamin12/Developer-Survey-Dataset"
#     repo_url = "https://github.com/k0msenapati/translation-service"
#     assistant.process_repository(repo_url)

#     # Query the repository
#     questions = [
#         "What is the main purpose of this repository?",
#         "What are the key classes and their responsibilities?",
#         "What are the main entry points of the application?",
#     ]

#     for question in questions:
#         print(f"\nQ: {question}")
#         answer = assistant.query_repository(question)
#         print(f"A: {answer}")
#         print("-" * 80)
# ----------------------------------------------------------------------------------------
# # Usage Example

# def main():
#     assistant = GitHubRepoAssistant()
#     # Process multiple repositories
#     repos = [
#         "https://github.com/Insharamin12/Developer-Survey-Dataset",
#         "https://github.com/k0msenapati/translation-service"
#     ]
#     repo_ids = []
#     for repo_url in repos:
#         success, repo_id = assistant.process_repository(repo_url)
#         if success:
#             repo_ids.append(repo_id)
#             print(f"Repository processed with ID: {repo_id}")
#     # List all repositories
#     print("\nAvailable repositories:")
#     # The list_repositories method in db.py returns 4 items, so we unpack 4
#     for repo_id, repo_url, collection_name, created_at in assistant.list_repositories():
#         print(f"ID: {repo_id}, URL: {repo_url}, Collection: {collection_name}")

#     # Query specific repository
#     if repo_ids:
#         repo_to_query = repo_ids[0]  # Query first repository
#         questions = [
#             "What is the main purpose of this repository?",
#             "What are the key classes and their responsibilities?",
#             "What are the main entry points of the application?",
#         ]

#         print(f"\nQuerying repository ID: {repo_to_query}")
#         for question in questions:
#             print(f"\nQ: {question}")
#             answer = assistant.query_repository(repo_to_query, question)
#             print(f"A: {answer}")
#             print("-" * 80)

# if __name__ == "__main__":
#     main()
