import asyncio
import os
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import quote_plus, unquote

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Database:
    client: Optional[AsyncIOMotorClient] = None


database = Database()


def _escape_userinfo(username: str, password: str) -> Tuple[str, str]:
    safe_username = quote_plus(unquote(username or ""))
    safe_password = quote_plus(unquote(password or ""))
    return safe_username, safe_password


def _normalize_mongodb_url(mongodb_url: str) -> str:
    if not mongodb_url or "://" not in mongodb_url or "@" not in mongodb_url:
        return mongodb_url

    scheme, rest = mongodb_url.split("://", 1)

    if "/" in rest:
        authority, suffix = rest.split("/", 1)
        suffix = "/" + suffix
    else:
        authority = rest
        suffix = ""

    if "@" not in authority:
        return mongodb_url

    userinfo, hostinfo = authority.rsplit("@", 1)
    if ":" not in userinfo:
        return mongodb_url

    username, password = userinfo.split(":", 1)
    safe_username, safe_password = _escape_userinfo(username, password)

    return f"{scheme}://{safe_username}:{safe_password}@{hostinfo}{suffix}"


def _build_mongodb_url_from_parts() -> Optional[str]:
    username = os.getenv("MONGODB_USERNAME")
    password = os.getenv("MONGODB_PASSWORD")
    host = os.getenv("MONGODB_HOST")

    if not (username and password and host):
        return None

    database_name = os.getenv("MONGODB_DATABASE", "greenchain")
    options = os.getenv("MONGODB_OPTIONS", "retryWrites=true&w=majority&appName=GreenChain")
    safe_username, safe_password = _escape_userinfo(username, password)
    options_suffix = f"?{options}" if options else ""

    return f"mongodb+srv://{safe_username}:{safe_password}@{host}/{database_name}{options_suffix}"


def _get_mongodb_url() -> str:
    mongodb_url = os.getenv("MONGODB_URL")
    if mongodb_url:
        return _normalize_mongodb_url(mongodb_url)

    mongodb_url = _build_mongodb_url_from_parts()
    if mongodb_url:
        return mongodb_url

    raise RuntimeError(
        "MongoDB configuration missing. Set MONGODB_URL, or set MONGODB_USERNAME/MONGODB_PASSWORD/MONGODB_HOST."
    )


async def get_database() -> AsyncIOMotorClient:
    if database.client is None:
        raise RuntimeError("Database client is not initialized")
    return database.client


async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = _get_mongodb_url()
    server_selection_timeout_ms = int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "8000"))
    connect_timeout_ms = int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "8000"))
    socket_timeout_ms = int(os.getenv("MONGODB_SOCKET_TIMEOUT_MS", "20000"))
    connect_retries = int(os.getenv("MONGODB_CONNECT_RETRIES", "5"))
    retry_delay_seconds = float(os.getenv("MONGODB_CONNECT_RETRY_DELAY_SECONDS", "3"))

    tls_allow_invalid_certificates = os.getenv("MONGODB_TLS_ALLOW_INVALID_CERTIFICATES", "false").lower() == "true"
    tls_allow_invalid_hostnames = os.getenv("MONGODB_TLS_ALLOW_INVALID_HOSTNAMES", "false").lower() == "true"
    use_tls = mongodb_url.startswith("mongodb+srv://") or os.getenv("MONGODB_USE_TLS", "false").lower() == "true"

    client_kwargs = {
        "serverSelectionTimeoutMS": server_selection_timeout_ms,
        "connectTimeoutMS": connect_timeout_ms,
        "socketTimeoutMS": socket_timeout_ms,
    }

    if use_tls:
        client_kwargs.update(
            {
                "tlsCAFile": certifi.where(),
                "tlsAllowInvalidCertificates": tls_allow_invalid_certificates,
                "tlsAllowInvalidHostnames": tls_allow_invalid_hostnames,
            }
        )

    last_error: Optional[Exception] = None
    for attempt in range(1, connect_retries + 1):
        try:
            database.client = AsyncIOMotorClient(mongodb_url, **client_kwargs)
            await database.client.admin.command("ping")
            print("Connected to MongoDB")
            return
        except PyMongoError as error:
            last_error = error
            if database.client is not None:
                database.client.close()
                database.client = None

            if attempt < connect_retries:
                print(
                    f"MongoDB connection attempt {attempt}/{connect_retries} failed: {error}. "
                    f"Retrying in {retry_delay_seconds} seconds..."
                )
                await asyncio.sleep(retry_delay_seconds)

    raise RuntimeError(f"Failed to connect to MongoDB: {last_error}") from last_error


async def close_mongo_connection():
    """Close database connection"""
    if database.client is not None:
        database.client.close()
    print("Disconnected from MongoDB")


async def get_collection(collection_name: str):
    """Get collection from database"""
    if database.client is None:
        raise RuntimeError("Database client is not initialized")
    db_name = os.getenv("MONGODB_DATABASE", "greenchain")
    db = database.client[db_name]
    return db[collection_name]