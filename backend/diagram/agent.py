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
        # Create a formatted string of file paths for the prompt
        file_list_str = "\n".join(f"- {path}" for path in file_paths)

        prompt = f"""
        You are an expert at creating Mermaid diagrams. Your task is to generate a Mermaid graph that visualizes the file structure of a GitHub repository.

        **Repository:** {repo_url}

        **File Structure:**
        ```
        {file_list_str}
        ```

        **Instructions:**
        1.  Create a `graph TD` (top-down tree graph).
        2.  Represent directories and files as nodes. Use the full path for uniqueness if necessary, but render only the base name.
        3.  Show the hierarchy by connecting directories to their subdirectories and files.
        4.  Do not include the root directory '.' in the graph.
        5.  Provide only the Mermaid code block, starting with ```mermaid and ending with ```. Do not add any other explanation.

        **Example Output Format:**
        ```mermaid
        graph TD
            A["Directory A"] --> B["File B.py"];
            A --> C["Sub-Directory C"];
            C --> D["File D.js"];
        ```

        Now, generate the Mermaid graph for the provided file structure.
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
