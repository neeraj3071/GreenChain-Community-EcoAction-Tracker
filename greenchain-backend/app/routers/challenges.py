from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timedelta


from app.models.schemas import ChallengeResponse, User
from app.services.auth_service import get_current_user
from app.services.database import get_collection
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.get("/", response_model=List[ChallengeResponse])
async def get_active_challenges():
    """Get all active challenges"""
    challenges_collection = await get_collection("challenges")
    
    # Get active challenges
    challenges = await challenges_collection.find(
        {"is_active": True, "target_date": {"$gte": datetime.utcnow()}}
    ).sort("created_at", -1).to_list(10)
    
    return [
        ChallengeResponse(
            id=str(challenge["_id"]),
            title=challenge["title"],
            description=challenge["description"],
            challenge_type=challenge["challenge_type"],
            points_reward=challenge["points_reward"],
            target_date=challenge["target_date"],
            is_active=challenge["is_active"],
            created_at=challenge["created_at"]
        )
        for challenge in challenges
    ]

@router.post("/generate")
async def generate_new_challenge(challenge_type: str = "daily"):
    """Generate a new challenge using AI"""
    users_collection = await get_collection("users")
    actions_collection = await get_collection("actions")
    challenges_collection = await get_collection("challenges")
    
    # Gather community data for AI
    total_users = await users_collection.count_documents({"is_active": True})
    
    # Get most popular action category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    popular_category_result = await actions_collection.aggregate(pipeline).to_list(1)
    popular_category = popular_category_result[0]["_id"] if popular_category_result else "recycling"
    
    # Calculate average daily actions
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_actions = await actions_collection.count_documents(
        {"created_at": {"$gte": week_ago}}
    )
    avg_actions = recent_actions / 7 if recent_actions > 0 else 5
    
    community_data = {
        "total_users": total_users,
        "popular_category": popular_category,
        "avg_actions": avg_actions
    }
    
    # Generate challenge using AI
    challenge_data = await gemini_service.generate_challenge(challenge_type, community_data)
    
    # Set target date based on challenge type
    if challenge_type == "daily":
        target_date = datetime.utcnow() + timedelta(days=1)
    else:  # weekly
        target_date = datetime.utcnow() + timedelta(days=7)
    
    # Create challenge document
    challenge_doc = {
        "title": challenge_data["title"],
        "description": challenge_data["description"],
        "challenge_type": challenge_type,
        "points_reward": challenge_data["points_reward"],
        "target_date": target_date,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    # Save to database
    result = await challenges_collection.insert_one(challenge_doc)
    
    return ChallengeResponse(
        id=str(result.inserted_id),
        title=challenge_doc["title"],
        description=challenge_doc["description"],
        challenge_type=challenge_doc["challenge_type"],
        points_reward=challenge_doc["points_reward"],
        target_date=challenge_doc["target_date"],
        is_active=challenge_doc["is_active"],
        created_at=challenge_doc["created_at"]
    )

@router.get("/today")
async def get_daily_challenge():
    """Get today's challenge"""
    challenges_collection = await get_collection("challenges")
    
    # Find today's challenge
    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)
    
    challenge = await challenges_collection.find_one({
        "challenge_type": "daily",
        "is_active": True,
        "created_at": {
            "$gte": datetime.combine(today, datetime.min.time()),
            "$lt": datetime.combine(tomorrow, datetime.min.time())
        }
    })
    
    if challenge:
        return ChallengeResponse(
            id=str(challenge["_id"]),
            title=challenge["title"],
            description=challenge["description"],
            challenge_type=challenge["challenge_type"],
            points_reward=challenge["points_reward"],
            target_date=challenge["target_date"],
            is_active=challenge["is_active"],
            created_at=challenge["created_at"]
        )
    
    return {"message": "No daily challenge available. Generate one!"}

@router.get("/weekly")
async def get_weekly_challenge():
    """Get this week's challenge"""
    challenges_collection = await get_collection("challenges")
    
    # Find this week's challenge (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    challenge = await challenges_collection.find_one({
        "challenge_type": "weekly",
        "is_active": True,
        "created_at": {"$gte": week_ago}
    })
    
    if challenge:
        return ChallengeResponse(
            id=str(challenge["_id"]),
            title=challenge["title"],
            description=challenge["description"],
            challenge_type=challenge["challenge_type"],
            points_reward=challenge["points_reward"],
            target_date=challenge["target_date"],
            is_active=challenge["is_active"],
            created_at=challenge["created_at"]
        )
    
    return {"message": "No weekly challenge available. Generate one!"}