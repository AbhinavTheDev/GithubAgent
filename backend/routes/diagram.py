from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from diagram.agent import DiagramOrchestrator
import core.state as state

router = APIRouter()


class DiagramResponse(BaseModel):
    graph_script: str


@router.get("/diagram/{repo_id}", response_model=DiagramResponse)
def generate_diagram(repo_id: int):
    """
    Generates a Mermaid graph script for the file structure of a given repository.
    """
    try:
        orchestrator = DiagramOrchestrator()
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

        graph_script = orchestrator.generate_graph_for_repo(repo_id)

        if graph_script.startswith("Error:"):
            raise HTTPException(status_code=404, detail=graph_script)

        return DiagramResponse(graph_script=graph_script)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )
