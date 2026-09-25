import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

logger = logging.getLogger("vayunet.db")

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "vayunet_db")

client = None
db = None
is_mongo_connected = False

# Resilient fallback store for local development without running MongoDB daemon
FALLBACK_USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "data_store_users.json")
_fallback_users: Dict[str, Dict[str, Any]] = {}

def _load_fallback_users():
    global _fallback_users
    if os.path.exists(FALLBACK_USERS_FILE):
        try:
            with open(FALLBACK_USERS_FILE, "r", encoding="utf-8") as f:
                _fallback_users = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load fallback users: {e}")
            _fallback_users = {}

def _save_fallback_users():
    try:
        with open(FALLBACK_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(_fallback_users, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Could not save fallback users: {e}")

_load_fallback_users()

async def connect_db():
    global client, db, is_mongo_connected
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        # Verify connection
        await client.server_info()
        db = client[DB_NAME]
        is_mongo_connected = True
        logger.info(f"Connected to MongoDB at {MONGO_URI} (DB: {DB_NAME})")
    except Exception as e:
        is_mongo_connected = False
        logger.info(f"MongoDB not reachable at {MONGO_URI} ({e}). Using resilient in-memory storage for user sessions.")

async def close_db():
    global client
    if client:
        client.close()

# Database helper functions for users
async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    if is_mongo_connected and db is not None:
        try:
            user = await db.users.find_one({"email": clean_email})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception as e:
            logger.error(f"Mongo error in get_user_by_email: {e}")
    
    return _fallback_users.get(clean_email)

async def create_user(user_dict: Dict[str, Any]) -> Dict[str, Any]:
    clean_email = user_dict["email"].strip().lower()
    user_dict["email"] = clean_email
    if "created_at" not in user_dict:
        user_dict["created_at"] = datetime.utcnow().isoformat()
    if "last_login" not in user_dict:
        user_dict["last_login"] = datetime.utcnow().isoformat()

    if is_mongo_connected and db is not None:
        try:
            res = await db.users.insert_one(user_dict)
            user_dict["_id"] = str(res.inserted_id)
            return user_dict
        except Exception as e:
            logger.error(f"Mongo error in create_user: {e}")
    
    # Fallback storage
    user_dict["_id"] = f"usr_{len(_fallback_users) + 1}_{int(datetime.utcnow().timestamp())}"
    _fallback_users[clean_email] = user_dict
    _save_fallback_users()
    return user_dict

async def update_user(email: str, update_fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    if is_mongo_connected and db is not None:
        try:
            await db.users.update_one({"email": clean_email}, {"$set": update_fields})
            return await get_user_by_email(clean_email)
        except Exception as e:
            logger.error(f"Mongo error in update_user: {e}")
    
    if clean_email in _fallback_users:
        _fallback_users[clean_email].update(update_fields)
        _save_fallback_users()
        return _fallback_users[clean_email]
    return None
