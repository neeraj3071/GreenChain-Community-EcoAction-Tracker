import os
from urllib.parse import quote_plus, unquote

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import InvalidURI
from pymongo.uri_parser import parse_uri

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None

database = Database()


def _normalize_mongodb_url(mongodb_url: str) -> str:
    if not mongodb_url:
        return mongodb_url

    try:
        parse_uri(mongodb_url)
        return mongodb_url
    except InvalidURI as error:
        if "must be escaped according to RFC 3986" not in str(error):
            raise

    if "://" not in mongodb_url or "@" not in mongodb_url:
        return mongodb_url

    scheme, rest = mongodb_url.split("://", 1)
    userinfo, tail = rest.rsplit("@", 1)

    if ":" not in userinfo:
        return mongodb_url

    username, password = userinfo.split(":", 1)
    safe_username = quote_plus(unquote(username))
    safe_password = quote_plus(unquote(password))

    return f"{scheme}://{safe_username}:{safe_password}@{tail}"

async def get_database() -> AsyncIOMotorClient:
    return database.client

async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        raise RuntimeError("MONGODB_URL is not configured")

    database.client = AsyncIOMotorClient(_normalize_mongodb_url(mongodb_url))
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    database.client.close()
    print("Disconnected from MongoDB")

async def get_collection(collection_name: str):
    """Get collection from database"""
    db = database.client.greenchain
    return db[collection_name]