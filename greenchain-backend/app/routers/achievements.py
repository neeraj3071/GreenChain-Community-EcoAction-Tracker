from fastapi import APIRouter, Depends
from app.models.schemas import User
from app.services.auth_service import get_current_user
from app.services.database import get_collection
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()

class AchievementSystem:
    """Advanced gamification system with badges and achievements"""
    
    BADGES = {
        "first_action": {"name": "Getting Started", "description": "Complete your first eco-action", "icon": "🌱"},
        "streak_7": {"name": "Week Warrior", "description": "7-day action streak", "icon": "🔥"},
        "streak_30": {"name": "Monthly Master", "description": "30-day action streak", "icon": "⚡"},
        "co2_saver": {"name": "Carbon Crusher", "description": "Save 100kg CO2", "icon": "💨"},
        "social_butterfly": {"name": "Community Leader", "description": "Connect with 10 friends", "icon": "🦋"},
        "challenge_master": {"name": "Challenge Champion", "description": "Complete 50 challenges", "icon": "🏆"},
        "eco_warrior": {"name": "Eco Warrior", "description": "1000+ total points", "icon": "⚔️"},
        "tree_hugger": {"name": "Tree Hugger", "description": "Plant or save 10 trees", "icon": "🌳"},
        "water_guardian": {"name": "Water Guardian", "description": "Complete 25 water conservation actions", "icon": "💧"},
        "energy_efficient": {"name": "Energy Efficient", "description": "Complete 25 energy saving actions", "icon": "💡"}
    }
    
    async def check_and_award_badges(self, user_id: str):
        """Check and award new badges to user"""
        users_collection = await get_collection("users")
        actions_collection = await get_collection("actions")
        badges_collection = await get_collection("user_badges")
        
        # Get user data
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        user_actions = await actions_collection.find({"user_id": user_id}).to_list(1000)
        
        existing_badges = await badges_collection.find({"user_id": user_id}).to_list(50)
        existing_badge_ids = [badge["badge_id"] for badge in existing_badges]
        
        new_badges = []
        
        # Check first action badge
        if len(user_actions) >= 1 and "first_action" not in existing_badge_ids:
            new_badges.append("first_action")
        
        # Check streak badges
        current_streak = await self._calculate_current_streak(user_id)
        if current_streak >= 7 and "streak_7" not in existing_badge_ids:
            new_badges.append("streak_7")
        if current_streak >= 30 and "streak_30" not in existing_badge_ids:
            new_badges.append("streak_30")
        
        # Check CO2 savings badge
        if user["total_co2_saved"] >= 100 and "co2_saver" not in existing_badge_ids:
            new_badges.append("co2_saver")
        
        # Check points badge
        if user["total_points"] >= 1000 and "eco_warrior" not in existing_badge_ids:
            new_badges.append("eco_warrior")
        
        # Check category-specific badges
        category_counts = {}
        for action in user_actions:
            cat = action.get("category", "other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        if category_counts.get("water_conservation", 0) >= 25 and "water_guardian" not in existing_badge_ids:
            new_badges.append("water_guardian")
        
        if category_counts.get("energy", 0) >= 25 and "energy_efficient" not in existing_badge_ids:
            new_badges.append("energy_efficient")
        
        # Award new badges
        for badge_id in new_badges:
            await badges_collection.insert_one({
                "user_id": user_id,
                "badge_id": badge_id,
                "awarded_at": datetime.utcnow()
            })
        
        return [self.BADGES[badge_id] for badge_id in new_badges]
    
    async def _calculate_current_streak(self, user_id: str):
        """Calculate user's current action streak"""
        actions_collection = await get_collection("actions")
        
        # Get recent actions sorted by date
        recent_actions = await actions_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).to_list(100)
        
        if not recent_actions:
            return 0
        
        streak = 0
        current_date = datetime.now().date()
        
        # Group actions by date
        actions_by_date = {}
        for action in recent_actions:
            action_date = action["created_at"].date()
            if action_date not in actions_by_date:
                actions_by_date[action_date] = 0
            actions_by_date[action_date] += 1
        
        # Calculate consecutive days
        for i in range(100):  # Check up to 100 days back
            check_date = current_date - timedelta(days=i)
            if check_date in actions_by_date:
                streak += 1
            else:
                break
        
        return streak

achievement_system = AchievementSystem()

@router.get("/achievements/badges")
async def get_user_badges(current_user: User = Depends(get_current_user)):
    """Get user's earned badges"""
    badges_collection = await get_collection("user_badges")
    
    user_badges = await badges_collection.find({"user_id": current_user.id}).to_list(50)
    
    badges_with_details = []
    for user_badge in user_badges:
        badge_id = user_badge["badge_id"]
        if badge_id in achievement_system.BADGES:
            badge_info = achievement_system.BADGES[badge_id].copy()
            badge_info["earned_at"] = user_badge["awarded_at"]
            badges_with_details.append(badge_info)
    
    return badges_with_details

@router.get("/achievements/progress")
async def get_achievement_progress(current_user: User = Depends(get_current_user)):
    """Get user's progress towards achievements"""
    actions_collection = await get_collection("actions")
    users_collection = await get_collection("users")
    
    user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    user_actions = await actions_collection.find({"user_id": current_user.id}).to_list(1000)
    
    current_streak = await achievement_system._calculate_current_streak(current_user.id)
    
    # Calculate category counts
    category_counts = {}
    for action in user_actions:
        cat = action.get("category", "other")
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    progress = {
        "total_actions": len(user_actions),
        "total_points": user["total_points"],
        "total_co2_saved": user["total_co2_saved"],
        "current_streak": current_streak,
        "category_progress": {
            "water_conservation": {
                "current": category_counts.get("water_conservation", 0),
                "target": 25,
                "badge": "Water Guardian 💧"
            },
            "energy": {
                "current": category_counts.get("energy", 0),
                "target": 25,
                "badge": "Energy Efficient 💡"
            },
            "transportation": {
                "current": category_counts.get("transportation", 0),
                "target": 20,
                "badge": "Green Commuter 🚲"
            }
        },
        "milestone_progress": {
            "points_to_eco_warrior": max(0, 1000 - user["total_points"]),
            "co2_to_carbon_crusher": max(0, 100 - user["total_co2_saved"]),
            "days_to_month_streak": max(0, 30 - current_streak)
        }
    }
    
    return progress

@router.post("/achievements/check")
async def check_new_achievements(current_user: User = Depends(get_current_user)):
    """Check and award any new achievements"""
    new_badges = await achievement_system.check_and_award_badges(current_user.id)
    return {"new_badges": new_badges}