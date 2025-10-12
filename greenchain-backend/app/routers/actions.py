from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.models.schemas import ActionCreate, ActionResponse, User
from app.services.auth_service import get_current_user
from app.services.database import get_collection
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/", response_model=ActionResponse)
async def create_action(action: ActionCreate, current_user: User = Depends(get_current_user)):
    """Create a new eco-action with Gemini AI validation"""
    
    # Validate action with Gemini AI
    validation_result = await gemini_service.validate_action(action.title, action.description)
    
    if not validation_result.get("valid", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action: {validation_result.get('feedback', 'Action not recognized as environmental')}"
        )
    
    # Create action document
    action_data = {
        "user_id": str(current_user.id),
        "title": validation_result.get("title", action.title),
        "description": action.description,
        "category": validation_result.get("category", "other"),
        "points": validation_result.get("points", 10),
        "co2_saved": validation_result.get("co2_saved", 1.0),
        "validated": True,
        "created_at": datetime.utcnow()
    }
    
    # Save to database
    actions_collection = await get_collection("actions")
    result = await actions_collection.insert_one(action_data)
    
    # Update user's total points and CO2 saved
    users_collection = await get_collection("users")
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$inc": {
                "total_points": action_data["points"],
                "total_co2_saved": action_data["co2_saved"]
            }
        }
    )
    
    return ActionResponse(
        id=str(result.inserted_id),
        user_id=action_data["user_id"],
        username=current_user.username,
        title=action_data["title"],
        description=action_data["description"],
        category=action_data["category"],
        points=action_data["points"],
        co2_saved=action_data["co2_saved"],
        validated=action_data["validated"],
        created_at=action_data["created_at"]
    )

@router.get("/", response_model=List[ActionResponse])
async def get_user_actions(current_user: User = Depends(get_current_user)):
    """Get all actions for the current user"""
    actions_collection = await get_collection("actions")
    
    actions = await actions_collection.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).to_list(100)
    
    return [
        ActionResponse(
            id=str(action["_id"]),
            user_id=action["user_id"],
            username=current_user.username,
            title=action["title"],
            description=action["description"],
            category=action["category"],
            points=action["points"],
            co2_saved=action["co2_saved"],
            validated=action["validated"],
            created_at=action["created_at"]
        )
        for action in actions
    ]

@router.get("/community", response_model=List[ActionResponse])
async def get_community_actions(limit: int = 20):
    """Get recent community actions for feed"""
    actions_collection = await get_collection("actions")
    users_collection = await get_collection("users")
    
    # Get recent actions with user data
    actions = await actions_collection.find().sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enhance with username data
    action_responses = []
    for action in actions:
        # Get username
        user = await users_collection.find_one({"_id": ObjectId(action["user_id"])})
        username = user.get("username", "Unknown") if user else "Unknown"
        
        action_responses.append(ActionResponse(
            id=str(action["_id"]),
            user_id=action["user_id"],
            username=username,
            title=action["title"],
            description=action["description"],
            category=action["category"],
            points=action["points"],
            co2_saved=action["co2_saved"],
            validated=action["validated"],
            created_at=action["created_at"]
        ))
    
    return action_responses

@router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    """Get AI-powered personalized recommendations"""
    actions_collection = await get_collection("actions")
    
    # Get user's recent actions
    user_actions = await actions_collection.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Get recent community actions
    community_actions = await actions_collection.find().sort("created_at", -1).limit(15).to_list(15)
    
    # Extract action titles for AI processing
    user_action_titles = [action["title"] for action in user_actions]
    community_action_titles = [action["title"] for action in community_actions]
    
    # Generate recommendations using Gemini
    recommendations = await gemini_service.generate_recommendations(
        user_action_titles, 
        community_action_titles
    )
    
    return {"recommendations": recommendations}

@router.get("/progress")
async def get_user_progress(current_user: User = Depends(get_current_user)):
    """Get user progress summary with AI-generated insights"""
    actions_collection = await get_collection("actions")
    
    # Get all user actions
    actions = await actions_collection.find(
        {"user_id": str(current_user.id)}
    ).to_list(None)
    
    # Generate AI summary
    progress_summary = await gemini_service.generate_progress_summary(actions)
    
    # Calculate stats
    total_actions = len(actions)
    total_points = current_user.total_points
    total_co2_saved = current_user.total_co2_saved
    
    # Category breakdown
    categories = {}
    for action in actions:
        category = action["category"]
        categories[category] = categories.get(category, 0) + 1
    
    return {
        "total_actions": total_actions,
        "total_points": total_points,
        "total_co2_saved": total_co2_saved,
        "categories": categories,
        "ai_summary": progress_summary
    }

@router.get("/recommendations")
async def get_personalized_recommendations(current_user: User = Depends(get_current_user)):
    """Get AI-powered personalized action recommendations"""
    from app.services.recommendation_service import recommendation_engine
    
    recommendations = await recommendation_engine.get_personalized_recommendations(current_user.id)
    return recommendations

@router.post("/predict-impact")
async def predict_action_impact(action_data: dict, current_user: User = Depends(get_current_user)):
    """Predict detailed carbon impact of a potential action"""
    from app.services.recommendation_service import recommendation_engine
    
    impact_prediction = await recommendation_engine.predict_carbon_impact(action_data["description"])
    return impact_prediction