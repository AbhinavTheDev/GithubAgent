<h1 align="center"> Dev Compass 🧭</h1>

> [!NOTE]
>
> Dev Compass is an application that helps you to analyze GitHub repositories easily using our chat assistant and workflow diagram generator so that you spend less time on finding and more on working on the codebases. We also have a Audio Preview feature that allows you get an instant audio preview of codebase so that you can also listen what the codebase is doing and how — all powered by Agno and Groq.

| Demo Video |
|------------|
| [![Video](https://i9.ytimg.com/vi/kEimO2RD3m0/mqdefault.jpg?v=6879b1d6&sqp=CKjj5sMG&rs=AOn4CLD3xC_CJSPoxHQtlbdN2nwqx-TFng)](https://youtu.be/kEimO2RD3m0)  |

## 🌟 Features

- **Repository Setup:** Add any public GitHub repo for analysis.
- **Dashboard:** View repo metadata, recent commits, and activity.
- **Chat:** Ask questions about the codebase.
- **File Tree:** Visualize project structure with Mermaid diagrams.
- **Audio:** Generate and play AI-powered audio previews about the repo.
- **Past Repos:** Revisit or delete previously analyzed repositories.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PyGithub, Agno, LLAMA through Groq, ChromaDB
- **Frontend:** React, Tailwind CSS, Wouter (routing)
- **Database:** SQLite

## 💻 Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- **Python 3.x**
- **Node.js**
- **Groq API Key:** Sign up at [Groq](https://groq.com/) and generate your API key.
- **GitHub Access Token:** Create a token in your [GitHub settings](https://github.com/settings/tokens) and add it to your `.env` file.

> **Note:** Make sure to configure your `.env` file with the required API keys and tokens before starting the application.

### 1. Clone the Repository

```sh
git clone https://github.com/abhinavthedev/devcompass.git
cd devcompass
```

### 2. Backend Setup

```sh
cd backend
```

```
uv venv
```

```
.venv\Scripts\activate  # On Windows
```

```
uv sync
```

- Configure your environment variables in `.env` (see `.env.example`).
- Start the backend server:

```sh
uvicorn main:app --reload
```

- Make sure your backend server runs at `http://127.0.0.1:8000`

### 3. Frontend Setup

```sh
cd frontend
```

```
bun install
```

```
bun run dev
```

## Usage

1. **Open the frontend app** in your browser (usually at `http://localhost:5173`).
2. **Enter a GitHub repository URL** on the index page and click "Analyze".
3. **Wait for processing**; you’ll be redirected to the dashboard when ready.
4. **Explore features:** Chat, File Tree, Audio, and revisit past repos.

## 👤 Author

<table>
  <tbody>
    <tr>
        <td valign="top" width="14.28%"><a href="https://github.com/AbhinavTheDev"><img src="https://github.com/AbhinavTheDev.png?s=100" width="130px;" alt="Abhinav"/></a><br /><a href="https://github.com/AbhinavTheDev"><h4><b>Abhinav</b></h3></a></td>
    </tr>
  </tbody>
</table>

---

<h2 align="center">📄 License</h2>

<p align="center">
<strong>Dev Compass</strong> is licensed under the <code>MIT</code> License. See the <a href="https://github.com/AbhinavTheDev/agent-hub/blob/main/LICENSE">LICENSE</a> file for more details.
</p>

---

<p align="center">
    <strong>🌟 If you find this project helpful, please give it a star on GitHub! 🌟</strong>
</p>
