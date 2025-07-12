import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import List

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""

    # DB Paths
    chroma_db_path: str = "./chroma_db"
    repo_db_path: str = "./data/repositories.db"

    # API settings
    API_STR: str = "/api"

    # GitHub settings
    GITHUB_TOKEN: str = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN", "")

    # Groq settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    GROQ_CHAT_MODEL_ID: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    GROQ_Summarizer_MODEL_ID: str = "meta-llama/llama-4-scout-17b-16e-instruct"

    GROQ_Diagram_MODEL_ID: str = "llama3-8b-8192"
    GROQ_POD_MODEL_ID: str = "llama3-8b-8192"

    # Repo Processing Setting
    file_extenions: List[str] = [
        ".py",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".java",
        ".c",
        ".cpp",
        ".cs",
        ".go",
        ".rb",
        ".php",
        ".html",
    ]


settings = Settings()
