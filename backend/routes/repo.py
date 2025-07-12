# from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# import core.state as state
from core.agent_singleton import get_agent
from datetime import datetime

# from typing import List, Optional
from typing import List

router = APIRouter()


class RepoInfo(BaseModel):
    id: int
    repo_url: str
    collection_name: str
    created_at: datetime


github_agent = get_agent()


# Get all Repo Info from DB
@router.get("/get-all-repos", response_model=List[RepoInfo])
def get_all_repos():
    """Get a list of all repositories from the database."""
    repos = github_agent.repo_manager.list_repositories()
    return [
        RepoInfo(id=r[0], repo_url=r[1], collection_name=r[2], created_at=r[3])
        for r in repos
    ]


# Fetch Repo Info from DB using Repo ID
@router.get("/repo/{repo_id}", response_model=RepoInfo)
def get_repo_by_id(repo_id: int):
    """Get information for a specific repository by its ID."""
    repo_info = github_agent.repo_manager.get_repository(repo_id)
    if not repo_info:
        raise HTTPException(status_code=404, detail="Repository not found")

    # We need to fetch the full record for the response model
    full_repo_info = next(
        (r for r in github_agent.repo_manager.list_repositories() if r[0] == repo_id),
        None,
    )
    if not full_repo_info:
        raise HTTPException(status_code=404, detail="Repository not found in full list")

    return RepoInfo(
        id=full_repo_info[0],
        repo_url=full_repo_info[1],
        collection_name=full_repo_info[2],
        created_at=full_repo_info[3],
    )


# fetch Repo Info from DB using URL
@router.get("/get-repo-by-url", response_model=RepoInfo)
def get_repo_by_url(url: str):
    """Get information for a specific repository by its URL."""
    repo_info = github_agent.repo_manager.get_repository_by_url(url)
    if not repo_info:
        raise HTTPException(status_code=404, detail="Repository not found")

    repo_id, _ = repo_info
    # We need to fetch the full record for the response model
    full_repo_info = next(
        (r for r in github_agent.repo_manager.list_repositories() if r[0] == repo_id),
        None,
    )
    if not full_repo_info:
        raise HTTPException(status_code=404, detail="Repository not found in full list")

    return RepoInfo(
        id=full_repo_info[0],
        repo_url=full_repo_info[1],
        collection_name=full_repo_info[2],
        created_at=full_repo_info[3],
    )


# Delete specific Repo from DB and Vector
@router.delete("/repo/{repo_id}", response_model=dict)
def delete_repo(repo_id: int):
    """Delete a repository from the database and vector store."""
    success = github_agent.delete_repository(repo_id)
    if not success:
        raise HTTPException(
            status_code=404, detail="Repository not found or could not be deleted."
        )
    return {"success": True, "message": f"Repository with ID {repo_id} deleted."}
