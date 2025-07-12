# GitHub Agent

A powerful automation tool for GitHub operations and workflows.

## Overview

GitHub Agent is designed to streamline and automate GitHub-related tasks and workflows. This tool helps developers, teams, and organizations manage their GitHub repositories more efficiently.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/abhinavthedev/GithubAgent.git
    cd GithubAgent
    ```
2. Add Envs
   ```bash
   GITHUB_TOKEN=
   GROQ_API_KEY=
   ```

3. Install dependencies:
    ```bash
    uv venv

    .venv/Scripts/activate

    uv sync
    ```
4. Start Server:
   ```bash
   uvicorn main:app --reload
   ```


Two Folder were created by itself:
```
- data/         - Sqlite DB
- chroma_db/     - Vector Store 
```