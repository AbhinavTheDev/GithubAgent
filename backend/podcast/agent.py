from groq import Groq
import os
import chromadb
from db.repo_db import RepositoryDataManager
from core.config import settings


class PodcastAgent:
    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

    def generate_script(self, repo_url: str, topic: str, context: str) -> str:
        """
        Generate podcast script using Groq LLM based on provided context.
        """
        prompt = f"""
        You are the host of "Code Cast," a podcast that breaks down software projects for developers.
        Your task is to create a short, engaging podcast script based on the provided information.

        **Podcast Details:**
        - **Repository:** {repo_url}
        - **Episode Topic:** {topic}

        **Context from the repository's documentation and code summaries:**
        ---
        {context}
        ---

        **Instructions:**
        1.  Start with a catchy intro: "Hello there! Today, we're diving into..."
        2.  Use the provided context to explain the repository and the episode's topic in a clear, conversational, and slightly enthusiastic tone.
        3.  Structure the script like a monologue. You can use sections like "What is it?", "How does it work?", and "Key Takeaways".
        4.  Do not just repeat the context. Synthesize it into a narrative.
        5.  Conclude with a summary and a teaser for the next episode.
        6.  The script should be approximately 2-3 minutes long when read aloud.

        Now, generate the podcast script.
        """

        try:
            response = self.groq_client.chat.completions.create(
                model=settings.GROQ_POD_MODEL_ID,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.4,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating podcast script for {repo_url}: {e}")
            return "An error occurred while generating the podcast script."


class PodcastOrchestrator:
    def __init__(
        self,
        repo_db_path: str = settings.repo_db_path,
        chroma_path: str = settings.chroma_db_path,
    ):
        self.repo_manager = RepositoryDataManager(repo_db_path)
        self.chroma_client = chromadb.PersistentClient(path=chroma_path)
        self.podcast_agent = PodcastAgent()

    def truncate_context(docs, max_chars=6000):
        context = ""
        for doc in docs:
            if len(context) + len(doc) > max_chars:
                break
            context += "\n\n---\n\n" + doc
        return context

    def generate_script_for_repo(self, repo_id: int) -> str:
        """
        Fetches full context for a repo and generates a podcast script.
        """
        # 1. Get repository info from the database
        repo = self.repo_manager.get_full_repository_by_id(repo_id)
        if not repo:
            return "Error: Repository with the given ID was not found."

        # 2. Check for a cached script
        if repo.podcast_script:
            print(f"Returning cached podcast script for repo_id: {repo_id}")
            return repo.podcast_script

        # 3. If not cached, generate the script
        print(
            f"No cached script found. Generating new podcast script for repo_id: {repo_id}"
        )
        repo_url, collection_name = repo.repo_url, repo.collection_name

        # 4. Get the full context from the vector database
        try:
            collection = self.chroma_client.get_collection(name=collection_name)
            results = collection.get()  # Gets all items in the collection

            if not results or not results.get("documents"):
                return "Error: No context found for this repository. Please ensure it has been processed."

            docs = "\n\n---\n\n".join(results["documents"])
            context = self.truncate_context(docs, max_chars=6500)
            topic = f"A deep dive into the {os.path.basename(repo_url)} repository."

        except Exception as e:
            print(
                f"Error fetching context from ChromaDB for collection '{collection_name}': {e}"
            )
            return "Error: Could not retrieve context from the vector database."

        # 5. Generate and cache the script
        script = self.podcast_agent.generate_script(repo_url, topic, context)
        if not script.startswith("An error occurred"):
            self.repo_manager.update_podcast_script(repo_id, script)

        return script
