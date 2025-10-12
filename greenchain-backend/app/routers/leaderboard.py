from fastapi import APIRouter, Depends
from typing import List

from app.models.schemas import LeaderboardEntry, User
from app.services.auth_service import get_current_user
from app.services.database import get_collection

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 10):
    """Get community leaderboard based on points"""
    users_collection = await get_collection("users")
    
    # Get top users by points
    top_users = await users_collection.find(
        {"is_active": True}
    ).sort("total_points", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for rank, user in enumerate(top_users, 1):
        leaderboard.append(LeaderboardEntry(
            username=user["username"],
            total_points=user["total_points"],
            total_co2_saved=user["total_co2_saved"],
            rank=rank
        ))
    
    return leaderboard

@router.get("/my-rank")
async def get_my_rank(current_user: User = Depends(get_current_user)):
    """Get current user's rank in the leaderboard"""
    users_collection = await get_collection("users")
    
    # Count users with more points
    higher_ranked = await users_collection.count_documents(
        {"total_points": {"$gt": current_user.total_points}, "is_active": True}
    )
    
    my_rank = higher_ranked + 1
    
    return {
        "rank": my_rank,
        "total_points": current_user.total_points,
        "total_co2_saved": current_user.total_co2_saved,
        "username": current_user.username
    }