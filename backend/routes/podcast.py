from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from podcast.agent import PodcastOrchestrator
import core.state as state


router = APIRouter()


class PodcastResponse(BaseModel):
    script: str


@router.post("/podcast/{repo_id}", response_model=PodcastResponse)
async def generate_podcast(repo_id: int):
    """
    Generates a podcast script for a given repository ID.
    """
    orchestrator = PodcastOrchestrator()

    # global state to indicate if a process is ongoing
    # if not state.agent_ready and state.last_processed_repo_id is None:
    #     if state.agent_error:
    #         raise HTTPException(
    #             status_code=400,
    #             detail=f"Repository processing setup failed: {state.error_message}",
    #         )
    #     else:
    #         raise HTTPException(
    #             status_code=403,
    #             detail="Repository setup is in progress. Please try again later.",
    #         )

    script = orchestrator.generate_script_for_repo(repo_id)

    if script.startswith("Error:"):
        raise HTTPException(status_code=404, detail=script)

    return PodcastResponse(script=script)
