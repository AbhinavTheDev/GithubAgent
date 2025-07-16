from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import core.state as state
from typing import List
from core.agent_singleton import get_agent
from db.chat_db import ChatHistoryManager

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class ChatHistoryItem(BaseModel):
    id: int
    repo_id: int
    query: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True


github_agent = get_agent()
chat_history_manager = ChatHistoryManager()


@router.post("/chat/{repo_id}", response_model=ChatResponse)
async def chat_endpoint(repo_id: int, req: ChatRequest):
    # Check if the specific repo exists in the DB.
    repo_info = github_agent.repo_manager.get_repository(repo_id)
    if not repo_info:
        raise HTTPException(
            status_code=404,
            detail=f"Repository with ID {repo_id} not found. Please process it first via the /setup endpoint.",
        )

    # global state to indicate if a process is ongoing
    # if not state.agent_ready and state.last_processed_repo_id is None:
    #     if state.agent_error:
    #         raise HTTPException(
    #             status_code=400, detail=f"Agent setup failed: {state.error_message}"
    #         )
    #     else:
    #         raise HTTPException(
    #             status_code=403,
    #             detail="An agent setup is in progress. Please try again later.",
    #         )

    response_content = github_agent.query_repository(repo_id, req.message)

    # Save the chat interaction to the database
    try:
        chat_history_manager.add_chat_message(
            repo_id=repo_id, query=req.message, response=response_content
        )
    except Exception as e:
        # Log the error, but don't fail the request just because history saving failed
        print(f"Could not save chat history: {e}")

    return {"response": response_content}


@router.get("/chat/{repo_id}/history", response_model=List[ChatHistoryItem])
def get_chat_history(repo_id: int):
    """
    Retrieves the chat history for a specific repository.
    """
    try:
        # First, check if the repository exists to give a clean 404
        repo_info = github_agent.repo_manager.get_repository(repo_id)
        if not repo_info:
            raise HTTPException(
                status_code=404, detail=f"Repository with ID {repo_id} not found."
            )

        history = chat_history_manager.get_chat_history(repo_id)
        return [ChatHistoryItem.model_validate(item, from_attributes=True) for item in history]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve chat history: {e}"
        )
