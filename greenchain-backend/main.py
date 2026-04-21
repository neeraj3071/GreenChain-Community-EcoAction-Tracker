from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import auth, actions, leaderboard, challenges, social, achievements, carbon_calculator, chatbot
from app.services.database import connect_to_mongo, close_mongo_connection

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(
    title="GreenChain API",
    description="Community Eco Action Tracker API",
    version="1.0.0"
)


def _get_allowed_origins():
    raw_origins = os.getenv("FRONTEND_URL", "http://localhost:3000")
    parsed_origins = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]

    for local_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        if local_origin not in parsed_origins:
            parsed_origins.append(local_origin)

    return parsed_origins

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(social.router, prefix="/api/social", tags=["social"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["achievements"])
app.include_router(carbon_calculator.router, prefix="/api/carbon", tags=["carbon-calculator"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])

@app.get("/")
async def root():
    return {"message": "GreenChain API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "false").lower() == "true",
    )