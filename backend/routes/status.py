from fastapi import APIRouter
import core.state as state
from datetime import datetime

router = APIRouter()

@router.get("/status")
def get_status():
    if state.agent_error:
        return {
            "status": "error",
            "message": state.error_message or "Setup failed",
        }
    elif state.agent_ready:
        return {
            "status": "ready",
            "repo_id": state.last_processed_repo_id,
        }
    else:
        elapsed = None
        if state.processing_start_time:
            elapsed = (datetime.now() - state.processing_start_time).total_seconds()
            
        return {
            "status": "processing",
            "elapsed_seconds": elapsed
        }