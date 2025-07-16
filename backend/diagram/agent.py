import os
from typing import List

from groq import Groq
import chromadb
from db.repo_db import RepositoryDataManager
from core.config import settings


class DiagramAgent:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

    def generate_graph(self, repo_url: str, file_paths: List[str]) -> str:
        """
        Generate a Mermaid graph for the file structure using Groq LLM.
        """
        # Extract the repository name from the URL
        repo_name = repo_url.rstrip("/").split("/")[-1]
        # Create a formatted string of file paths for the prompt
        file_list_str = "\n".join(f"- {path}" for path in file_paths)

        prompt = f"""
        Given the file structure of a GitHub repository, generate an optimized Mermaid diagram that represents the high-level architecture of the codebase. Group related files and directories into logical components (e.g., controllers, models, utils, api) and represent these components as subgraph nodes in the diagram. Use only the following Mermaid syntax: graph, subgraph, and --> (for connections). Ensure that:

        Files belonging to a logical component are included within its subgraph and do not appear as separate nodes outside the subgraph.
        Connections are made between subgraphs or high-level components, avoiding redundant links to individual files.
        Only critical entry points (e.g., main.py, app.js, config.json) or standalone files (e.g., deploy.sh, requirements.txt) are represented as separate nodes outside of subgraphs.
        The root directory acts as the top-level node, with subgraphs representing major components of the codebase. Prioritize simplicity, readability, and scalability. Avoid clutter by collapsing subdirectories into logical components where appropriate.
        
        project_name: {repo_name}
        
        file structure: {file_list_str}
        
        Diagram:
        """

        try:
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_Diagram_MODEL_ID,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.1,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating diagram for {repo_url}: {e}")
            return "An error occurred while generating the diagram."


class DiagramOrchestrator:
    def __init__(
        self,
        repo_db_path: str = settings.repo_db_path,
        chroma_path: str = settings.chroma_db_path,
    ):
        self.repo_manager = RepositoryDataManager(repo_db_path)
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)
        self.diagram_agent = DiagramAgent()

    def generate_graph_for_repo(self, repo_id: int) -> str:
        """
        Fetches the file structure for a repo and generates a Mermaid graph.
        """
        # 1. Get repository info from the database
        repo = self.repo_manager.get_full_repository_by_id(repo_id)
        if not repo:
            return "Error: Repository with the given ID was not found."

        # 2. Check for a cached graph
        if repo.diagram_script:
            print(f"Returning cached diagram for repo_id: {repo_id}")
            return repo.diagram_script

        # 3. If not cached, generate the graph
        print(f"No cached diagram found. Generating new diagram for repo_id: {repo_id}")
        repo_url, collection_name = repo.repo_url, repo.collection_name

        try:
            collection = self.chroma_client.get_collection(name=collection_name)
            # Fetch only metadata to be efficient
            results = collection.get(include=["metadatas"])

            if not results or not results.get("metadatas"):
                return "Error: No context found for this repository. Please ensure it has been processed."

            # Extract the file_path from each metadata entry
            file_paths = [
                meta["file_path"]
                for meta in results["metadatas"]
                if "file_path" in meta
            ]

            if not file_paths:
                return (
                    "Error: Could not find any file paths in the repository's metadata."
                )

        except Exception as e:
            print(
                f"Error fetching metadata from ChromaDB for collection '{collection_name}': {e}"
            )
            return "Error: Could not retrieve file structure from the vector database."

        # 4. Generate and cache the graph
        graph = self.diagram_agent.generate_graph(repo_url, file_paths)
        if not graph.startswith("An error occurred"):
            self.repo_manager.update_diagram_script(repo_id, graph)

        return graph
