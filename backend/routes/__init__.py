from fastapi import APIRouter
from core.config import settings
from routes.chat import router as chat_router
from routes.repo import router as repo_router
from routes.status import router as status_router
from routes.setup import router as setup_router
from routes.podcast import router as podcast_router
from routes.diagram import router as diagram_router


api_router = APIRouter(prefix=settings.API_STR)

api_router.include_router(setup_router, tags=["setup"])
api_router.include_router(repo_router, tags=["Repositories"])
api_router.include_router(chat_router, tags=["chat"])
api_router.include_router(podcast_router, tags=["podcast"])
api_router.include_router(status_router, tags=["setup status"])
api_router.include_router(diagram_router, tags=["diagram"])