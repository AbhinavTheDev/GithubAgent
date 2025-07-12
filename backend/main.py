from fastapi import FastAPI
from routes import api_router

app = FastAPI(
    title="DevCompass API",
    version="1.0.0",
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root():
    """Root"""
    return {"message": "Welcome to the DevCompass API! Use /docs for documentation."}
