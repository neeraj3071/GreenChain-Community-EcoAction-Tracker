import asyncio
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Add the parent directory to the path to import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.database import get_collection
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_sample_data():
    """Create sample users, actions, and challenges for demo purposes"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client.greenchain
    
    # Clear existing data (for fresh demo)
    await db.users.delete_many({})
    await db.actions.delete_many({})
    await db.challenges.delete_many({})
    
    print("Creating sample users...")
    
    # Create sample users
    sample_users = [
        {
            "email": "alice@example.com",
            "username": "eco_alice",
            "hashed_password": pwd_context.hash("password123"),
            "full_name": "Alice Green",
            "total_points": 0,
            "total_co2_saved": 0.0,
            "created_at": datetime.utcnow() - timedelta(days=30),
            "is_active": True
        },
        {
            "email": "bob@example.com",
            "username": "green_bob",
            "hashed_password": pwd_context.hash("password123"),
            "full_name": "Bob Sustainable",
            "total_points": 0,
            "total_co2_saved": 0.0,
            "created_at": datetime.utcnow() - timedelta(days=25),
            "is_active": True
        },
        {
            "email": "carol@example.com",
            "username": "eco_warrior_carol",
            "hashed_password": pwd_context.hash("password123"),
            "full_name": "Carol Earth",
            "total_points": 0,
            "total_co2_saved": 0.0,
            "created_at": datetime.utcnow() - timedelta(days=20),
            "is_active": True
        },
        {
            "email": "demo@greenchain.com",
            "username": "demo_user",
            "hashed_password": pwd_context.hash("demo123"),
            "full_name": "Demo User",
            "total_points": 0,
            "total_co2_saved": 0.0,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    
    user_results = await db.users.insert_many(sample_users)
    user_ids = [str(id) for id in user_results.inserted_ids]
    
    print(f"Created {len(user_ids)} sample users")
    
    # Create sample actions
    sample_actions = [
        # Alice's actions
        {
            "user_id": user_ids[0],
            "title": "Planted 5 trees in local park",
            "description": "Joined community tree planting event and planted 5 oak trees",
            "category": "tree_planting",
            "points": 50,
            "co2_saved": 25.0,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "user_id": user_ids[0],
            "title": "Switched to LED bulbs",
            "description": "Replaced all incandescent bulbs in my home with LED alternatives",
            "category": "energy_saving",
            "points": 30,
            "co2_saved": 15.5,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "user_id": user_ids[0],
            "title": "Started composting kitchen scraps",
            "description": "Set up a composting bin for organic waste reduction",
            "category": "waste_reduction",
            "points": 25,
            "co2_saved": 8.2,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=1)
        },
        
        # Bob's actions
        {
            "user_id": user_ids[1],
            "title": "Biked to work for a week",
            "description": "Chose cycling over driving for my daily commute",
            "category": "transportation",
            "points": 35,
            "co2_saved": 18.7,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=4)
        },
        {
            "user_id": user_ids[1],
            "title": "Installed water-saving showerhead",
            "description": "Reduced water consumption by 40% with new low-flow showerhead",
            "category": "water_conservation",
            "points": 20,
            "co2_saved": 5.5,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "user_id": user_ids[1],
            "title": "Organized neighborhood recycling drive",
            "description": "Collected and properly sorted 200kg of recyclable materials",
            "category": "recycling",
            "points": 60,
            "co2_saved": 32.1,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(hours=12)
        },
        
        # Carol's actions
        {
            "user_id": user_ids[2],
            "title": "Solar panel installation",
            "description": "Installed 4kW solar panel system on rooftop",
            "category": "energy_saving",
            "points": 80,
            "co2_saved": 45.0,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=6)
        },
        {
            "user_id": user_ids[2],
            "title": "Zero waste grocery shopping",
            "description": "Completed monthly grocery shopping without any single-use packaging",
            "category": "waste_reduction",
            "points": 40,
            "co2_saved": 12.3,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "user_id": user_ids[2],
            "title": "Rainwater harvesting system",
            "description": "Built a 500L rainwater collection system for garden irrigation",
            "category": "water_conservation",
            "points": 45,
            "co2_saved": 15.8,
            "validated": True,
            "created_at": datetime.utcnow() - timedelta(hours=6)
        }
    ]
    
    await db.actions.insert_many(sample_actions)
    print(f"Created {len(sample_actions)} sample actions")
    
    # Update user points and CO2 savings
    for i, user_id in enumerate(user_ids[:3]):  # Don't update demo user initially
        user_actions = [action for action in sample_actions if action["user_id"] == user_id]
        total_points = sum(action["points"] for action in user_actions)
        total_co2 = sum(action["co2_saved"] for action in user_actions)
        
        await db.users.update_one(
            {"_id": user_results.inserted_ids[i]},
            {
                "$set": {
                    "total_points": total_points,
                    "total_co2_saved": total_co2
                }
            }
        )
    
    print("Updated user statistics")
    
    # Create sample challenges
    sample_challenges = [
        {
            "title": "Daily Green Commute",
            "description": "Use sustainable transportation (walk, bike, public transport) for all trips today",
            "challenge_type": "daily",
            "points_reward": 25,
            "target_date": datetime.utcnow() + timedelta(days=1),
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Weekly Waste Warrior",
            "description": "Reduce household waste by 50% this week through conscious consumption and recycling",
            "challenge_type": "weekly",
            "points_reward": 75,
            "target_date": datetime.utcnow() + timedelta(days=7),
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.challenges.insert_many(sample_challenges)
    print(f"Created {len(sample_challenges)} sample challenges")
    
    print("\n✅ Sample data creation completed!")
    print("\nDemo credentials:")
    print("Email: demo@greenchain.com")
    print("Password: demo123")
    print("\nOther test users:")
    print("- alice@example.com / password123")
    print("- bob@example.com / password123")
    print("- carol@example.com / password123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())