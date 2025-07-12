from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from core.agent_singleton import get_agent
import core.state as state
from datetime import datetime

router = APIRouter()


class SetRepoRequest(BaseModel):
    url: str


class SetRepoResponse(BaseModel):
    success: bool
    message: str


github_agent = get_agent()


def setup_repo(repo_url: str):
    """Background task to process a repository."""
    state.processing_start_time = datetime.now()
    success = github_agent.process_repository(repo_url)

    if success:
        state.agent_ready = True
        return {"success": True}
    else:
        state.agent_error = True
        return {"success": False, "error": "Failed to set up agent"}


# Set Up Repo for Agent
@router.post("/setup", response_model=SetRepoResponse)
async def set_repo_endpoint(req: SetRepoRequest, background_tasks: BackgroundTasks):
    state.agent_ready = False
    state.agent_error = False

    background_tasks.add_task(setup_repo, req.url)

    return {
        "success": True,
        "message": "Setup started. You can check status or try /chat later.",
    }
