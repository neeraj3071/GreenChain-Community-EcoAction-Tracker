
from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.models.schemas import User, TeamCreate, TeamResponse, TeamMember
from app.services.auth_service import get_current_user
from app.services.database import get_collection
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List
import json

router = APIRouter()

# --- Friends Endpoints ---
@router.get("/friends")
async def get_friends(current_user: User = Depends(get_current_user)):
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    if not user:
        return []
    friend_ids = user.get("friends", [])
    friends = []
    for fid in friend_ids:
        f = await users_collection.find_one({"_id": ObjectId(fid)})
        if f:
            friends.append({
                "id": str(f["_id"]),
                "username": f["username"],
                "full_name": f.get("full_name"),
                "total_points": f.get("total_points", 0)
            })
    return friends

@router.post("/connect")
async def connect_with_user(user_id: str = Body(...), current_user: User = Depends(get_current_user)):
    users_collection = await get_collection("users")
    # Add each other as friends (bidirectional)
    await users_collection.update_one({"_id": ObjectId(current_user.id)}, {"$addToSet": {"friends": user_id}})
    await users_collection.update_one({"_id": ObjectId(user_id)}, {"$addToSet": {"friends": current_user.id}})
    return {"message": "Connected as friends"}

# Demo endpoints without authentication
@router.post("/demo/teams/create")
async def create_team_demo(team_data: TeamCreate):
    """Create a new team for collaborative challenges (Demo mode - no auth required)"""
    teams_collection = await get_collection("teams")
    
    # Check if team name already exists
    existing_team = await teams_collection.find_one({"name": team_data.name})
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists"
        )
    
    # Create team document with demo user
    demo_user_id = "demo-user-123"
    team = {
        "name": team_data.name,
        "description": team_data.description or f"Team {team_data.name} - Working together for a greener planet!",
        "creator_id": demo_user_id,
        "members": [demo_user_id],
        "total_points": 100,  # Demo starting points
        "total_co2_saved": 50.5,  # Demo CO2 savings
        "created_at": datetime.utcnow(),
        "is_public": team_data.is_public,
        "max_members": team_data.max_members
    }
    
    result = await teams_collection.insert_one(team)
    
    # Return team response
    return {
        "id": str(result.inserted_id),
        "name": team["name"],
        "description": team["description"],
        "creator_id": team["creator_id"],
        "members": team["members"],
        "member_count": len(team["members"]),
        "total_points": team["total_points"],
        "total_co2_saved": team["total_co2_saved"],
        "created_at": team["created_at"],
        "is_public": team["is_public"],
        "max_members": team["max_members"]
    }

@router.get("/demo/teams/leaderboard")
async def get_team_leaderboard_demo():
    """Get team leaderboard (Demo mode - no auth required)"""
    teams_collection = await get_collection("teams")
    
    # Check if we have any teams, if not, create some demo teams
    team_count = await teams_collection.count_documents({})
    if team_count == 0:
        # Create demo teams
        demo_teams = [
            {
                "name": "Eco Warriors",
                "description": "Leading the charge for environmental protection!",
                "creator_id": "demo-creator-1",
                "members": ["demo-user-1", "demo-user-2", "demo-user-3"],
                "total_points": 1250,
                "total_co2_saved": 385.5,
                "created_at": datetime.utcnow() - timedelta(days=30),
                "is_public": True,
                "max_members": 50
            },
            {
                "name": "Green Champions", 
                "description": "Champions of sustainable living",
                "creator_id": "demo-creator-2",
                "members": ["demo-user-4", "demo-user-5"],
                "total_points": 980,
                "total_co2_saved": 290.0,
                "created_at": datetime.utcnow() - timedelta(days=20),
                "is_public": True,
                "max_members": 50
            },
            {
                "name": "Planet Savers",
                "description": "Saving our planet one action at a time",
                "creator_id": "demo-creator-3", 
                "members": ["demo-user-6", "demo-user-7", "demo-user-8", "demo-user-9"],
                "total_points": 1450,
                "total_co2_saved": 420.0,
                "created_at": datetime.utcnow() - timedelta(days=15),
                "is_public": True,
                "max_members": 50
            }
        ]
        
        await teams_collection.insert_many(demo_teams)
    
    teams = await teams_collection.find({"is_public": True}).sort("total_points", -1).to_list(100)
    
    team_responses = []
    for team in teams:
        team_responses.append({
            "id": str(team["_id"]),
            "name": team["name"],
            "description": team.get("description", ""),
            "creator_id": team["creator_id"],
            "members": team["members"],
            "member_count": len(team["members"]),
            "total_points": team["total_points"],
            "total_co2_saved": team["total_co2_saved"],
            "created_at": team["created_at"],
            "is_public": team["is_public"],
            "max_members": team.get("max_members", 50)
        })
    
    return team_responses

@router.post("/demo/teams/{team_id}/join")
async def join_team_demo(team_id: str):
    """Join an existing team (Demo mode - no auth required)"""
    teams_collection = await get_collection("teams")
    
    # Check if team exists
    try:
        team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid team ID"
        )
        
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    demo_user_id = f"demo-user-{len(team['members']) + 1}"
    
    # Check if team is full
    if len(team["members"]) >= team.get("max_members", 50):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full"
        )
    
    # Add demo user to team
    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$addToSet": {"members": demo_user_id},
            "$inc": {
                "total_points": 50,  # Demo points contribution
                "total_co2_saved": 25.0  # Demo CO2 contribution
            }
        }
    )
    
    # Get updated team info
    updated_team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    
    return {
        "message": "Successfully joined team",
        "team_name": updated_team["name"],
        "member_number": len(updated_team["members"]),
        "total_members": len(updated_team["members"])
    }

@router.post("/teams/create", response_model=TeamResponse)
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_current_user)):
    """Create a new team for collaborative challenges"""
    teams_collection = await get_collection("teams")
    
    # Check if team name already exists
    existing_team = await teams_collection.find_one({"name": team_data.name})
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists"
        )
    
    # Create team document
    team = {
        "name": team_data.name,
        "description": team_data.description or f"Team {team_data.name} - Working together for a greener planet!",
        "creator_id": current_user.id,
        "members": [current_user.id],
        "total_points": current_user.total_points,
        "total_co2_saved": current_user.total_co2_saved,
        "created_at": datetime.utcnow(),
        "is_public": team_data.is_public,
        "max_members": team_data.max_members
    }
    
    result = await teams_collection.insert_one(team)
    
    # Create team membership record
    memberships_collection = await get_collection("team_memberships")
    membership = {
        "team_id": str(result.inserted_id),
        "user_id": current_user.id,
        "role": "creator",
        "joined_at": datetime.utcnow(),
        "points_contributed": current_user.total_points,
        "co2_contributed": current_user.total_co2_saved
    }
    await memberships_collection.insert_one(membership)
    
    # Return team response
    return TeamResponse(
        id=str(result.inserted_id),
        name=team["name"],
        description=team["description"],
        creator_id=team["creator_id"],
        members=team["members"],
        member_count=len(team["members"]),
        total_points=team["total_points"],
        total_co2_saved=team["total_co2_saved"],
        created_at=team["created_at"],
        is_public=team["is_public"],
        max_members=team["max_members"]
    )

@router.post("/teams/{team_id}/join")
async def join_team(team_id: str, current_user: User = Depends(get_current_user)):
    """Join an existing team"""
    teams_collection = await get_collection("teams")
    memberships_collection = await get_collection("team_memberships")
    
    # Check if team exists
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is already a member
    if current_user.id in team["members"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this team"
        )
    
    # Check if team is full
    if len(team["members"]) >= team.get("max_members", 50):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full"
        )
    
    # Add user to team
    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$addToSet": {"members": current_user.id},
            "$inc": {
                "total_points": current_user.total_points,
                "total_co2_saved": current_user.total_co2_saved
            }
        }
    )
    
    # Create membership record
    membership = {
        "team_id": team_id,
        "user_id": current_user.id,
        "role": "member",
        "joined_at": datetime.utcnow(),
        "points_contributed": current_user.total_points,
        "co2_contributed": current_user.total_co2_saved
    }
    await memberships_collection.insert_one(membership)
    
    # Get updated team info
    updated_team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    
    return {
        "message": "Successfully joined team",
        "team_name": updated_team["name"],
        "member_number": len(updated_team["members"]),
        "total_members": len(updated_team["members"])
    }

@router.get("/teams/leaderboard", response_model=List[TeamResponse])
async def get_team_leaderboard(current_user: User = Depends(get_current_user)):
    """Get team leaderboard with all teams"""
    teams_collection = await get_collection("teams")
    
    teams = await teams_collection.find({"is_public": True}).sort("total_points", -1).to_list(100)
    
    team_responses = []
    for team in teams:
        team_responses.append(TeamResponse(
            id=str(team["_id"]),
            name=team["name"],
            description=team.get("description", ""),
            creator_id=team["creator_id"],
            members=team["members"],
            member_count=len(team["members"]),
            total_points=team["total_points"],
            total_co2_saved=team["total_co2_saved"],
            created_at=team["created_at"],
            is_public=team["is_public"],
            max_members=team.get("max_members", 50)
        ))
    
    return team_responses

@router.get("/teams/my-teams", response_model=List[TeamResponse])
async def get_my_teams(current_user: User = Depends(get_current_user)):
    """Get all teams the current user is a member of"""
    teams_collection = await get_collection("teams")
    
    teams = await teams_collection.find({
        "members": {"$in": [current_user.id]}
    }).to_list(100)
    
    team_responses = []
    for team in teams:
        team_responses.append(TeamResponse(
            id=str(team["_id"]),
            name=team["name"],
            description=team.get("description", ""),
            creator_id=team["creator_id"],
            members=team["members"],
            member_count=len(team["members"]),
            total_points=team["total_points"],
            total_co2_saved=team["total_co2_saved"],
            created_at=team["created_at"],
            is_public=team["is_public"],
            max_members=team.get("max_members", 50)
        ))
    
    return team_responses

@router.get("/teams/{team_id}/members", response_model=List[TeamMember])
async def get_team_members(team_id: str, current_user: User = Depends(get_current_user)):
    """Get all members of a specific team"""
    teams_collection = await get_collection("teams")
    users_collection = await get_collection("users")
    memberships_collection = await get_collection("team_memberships")
    
    # Check if team exists and user has access
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    if not team["is_public"] and current_user.id not in team["members"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to private team"
        )
    
    # Get member details
    members = []
    for member_id in team["members"]:
        user = await users_collection.find_one({"_id": ObjectId(member_id)})
        membership = await memberships_collection.find_one({
            "team_id": team_id,
            "user_id": member_id
        })
        
        if user and membership:
            members.append(TeamMember(
                id=str(user["_id"]),
                username=user["username"],
                full_name=user.get("full_name"),
                total_points=user["total_points"],
                total_co2_saved=user["total_co2_saved"],
                joined_at=membership["joined_at"],
                role=membership.get("role", "member")
            ))
    
    return members

@router.post("/teams/{team_id}/leave")
async def leave_team(team_id: str, current_user: User = Depends(get_current_user)):
    """Leave a team"""
    teams_collection = await get_collection("teams")
    memberships_collection = await get_collection("team_memberships")
    
    # Check if team exists
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is a member
    if current_user.id not in team["members"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this team"
        )
    
    # Don't allow creator to leave if there are other members
    if team["creator_id"] == current_user.id and len(team["members"]) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team creator cannot leave while there are other members. Transfer ownership first."
        )
    
    # Remove user from team
    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$pull": {"members": current_user.id},
            "$inc": {
                "total_points": -current_user.total_points,
                "total_co2_saved": -current_user.total_co2_saved
            }
        }
    )
    
    # Remove membership record
    await memberships_collection.delete_one({
        "team_id": team_id,
        "user_id": current_user.id
    })
    
    # If creator left and was the only member, delete the team
    updated_team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if updated_team and len(updated_team["members"]) == 0:
        await teams_collection.delete_one({"_id": ObjectId(team_id)})
        return {"message": "Left team and team was deleted (no members remaining)"}
    
    return {"message": "Successfully left team"}

@router.post("/social/connect")
async def send_friend_request(friend_email: str, current_user: User = Depends(get_current_user)):
    """Send a friend request to connect with other users"""
    users_collection = await get_collection("users")
    connections_collection = await get_collection("connections")
    
    # Find friend by email
    friend = await users_collection.find_one({"email": friend_email})
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create connection request
    connection = {
        "requester_id": current_user.id,
        "recipient_id": str(friend["_id"]),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    await connections_collection.insert_one(connection)
    return {"message": f"Friend request sent to {friend_email}"}

@router.get("/social/friends")
async def get_friends(current_user: User = Depends(get_current_user)):
    """Get user's friends and their recent activities"""
    connections_collection = await get_collection("connections")
    actions_collection = await get_collection("actions")
    users_collection = await get_collection("users")
    
    # Get accepted connections
    connections = await connections_collection.find({
        "$or": [
            {"requester_id": current_user.id, "status": "accepted"},
            {"recipient_id": current_user.id, "status": "accepted"}
        ]
    }).to_list(50)
    
    friends_activities = []
    for conn in connections:
        friend_id = conn["recipient_id"] if conn["requester_id"] == current_user.id else conn["requester_id"]
        
        # Get friend's recent actions
        friend_actions = await actions_collection.find(
            {"user_id": friend_id}
        ).sort("created_at", -1).limit(3).to_list(3)
        
        friend = await users_collection.find_one({"_id": ObjectId(friend_id)})
        
        friends_activities.append({
            "friend_name": friend["username"],
            "recent_actions": [
                {
                    "title": action["title"],
                    "points": action["points"],
                    "created_at": action["created_at"]
                }
                for action in friend_actions
            ]
        })
    
    return friends_activities

@router.get("/discover-users")
async def discover_users(current_user: User = Depends(get_current_user)):
    """Discover other eco-warriors to connect with"""
    users_collection = await get_collection("users")
    connections_collection = await get_collection("connections")
    
    # Get users the current user is not connected to
    existing_connections = await connections_collection.find({
        "$or": [
            {"requester_id": current_user.id},
            {"recipient_id": current_user.id}
        ]
    }).to_list(100)
    
    connected_user_ids = set()
    for conn in existing_connections:
        if conn["requester_id"] != current_user.id:
            connected_user_ids.add(conn["requester_id"])
        if conn["recipient_id"] != current_user.id:
            connected_user_ids.add(conn["recipient_id"])
    
    # Find users to suggest (excluding current user and existing connections)
    exclude_ids = list(connected_user_ids) + [current_user.id]
    
    users = await users_collection.find({
        "_id": {"$nin": [ObjectId(uid) for uid in exclude_ids if ObjectId.is_valid(uid)]},
        "is_active": True
    }).sort("total_points", -1).limit(10).to_list(10)
    
    discovered_users = []
    for user in users:
        discovered_users.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "full_name": user.get("full_name"),
            "total_points": user["total_points"],
            "total_co2_saved": user["total_co2_saved"]
        })
    
    return discovered_users