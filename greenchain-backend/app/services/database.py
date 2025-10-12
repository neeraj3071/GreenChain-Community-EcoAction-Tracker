from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None

database = Database()

async def get_database() -> AsyncIOMotorClient:
    return database.client

async def connect_to_mongo():
    """Create database connection"""
    database.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    database.client.close()
    print("Disconnected from MongoDB")

async def get_collection(collection_name: str):
    """Get collection from database"""
    db = database.client.greenchain
    return db[collection_name]