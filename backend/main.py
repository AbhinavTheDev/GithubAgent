from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import api_router

app = FastAPI(
    title="DevCompass API",
    version="1.0.0",
)

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Adjust if your frontend runs on a different port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root():
    """Root"""
    return {"message": "Welcome to the DevCompass API! Use /docs for documentation."}
