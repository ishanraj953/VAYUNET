import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    # Also load from parent directory if needed
    parent_env = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    if os.path.exists(parent_env):
        load_dotenv(parent_env)
except Exception:
    pass

logger = logging.getLogger("vayunet.db")

# Default MongoDB Atlas Cluster URI
DEFAULT_ATLAS_URI = "mongodb+srv://ishanraj953:%40Googlekk953@cluster0.6c3ws3t.mongodb.net/vayunet?retryWrites=true&w=majority&appName=Cluster0"

def get_mongo_uri() -> str:
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or DEFAULT_ATLAS_URI

def get_db_name() -> str:
    return os.getenv("DATABASE_NAME") or os.getenv("DB_NAME") or "vayunet"

client = None
db = None
is_mongo_connected = False

# Resilient fallback store for offline development
FALLBACK_USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "data_store_users.json")
_fallback_users: Dict[str, Dict[str, Any]] = {}

def _seed_initial_users():
    global _fallback_users
    from backend.services.auth_service import hash_password
    seed_accounts = [
        {
            "name": "Dr. Ishan Raj (Admin Director)",
            "email": "admin@vayunet.in",
            "password_hash": hash_password("admin123"),
            "provider": "local",
            "role": "admin",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Ishan%20Raj",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        },
        {
            "name": "Chief Environmental Analyst",
            "email": "analyst@vayunet.in",
            "password_hash": hash_password("analyst123"),
            "provider": "local",
            "role": "analyst",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Environmental%20Analyst",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        },
        {
            "name": "State Pollution Control Officer",
            "email": "analyst@vayunet.gov.in",
            "password_hash": hash_password("analyst123"),
            "provider": "local",
            "role": "analyst",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=State%20Officer",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        },
        {
            "name": "Guest Policy Researcher",
            "email": "demo@vayunet.in",
            "password_hash": hash_password("demo123"),
            "provider": "local",
            "role": "user",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Guest%20Researcher",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.utcnow().isoformat()
        }
    ]
    for acc in seed_accounts:
        if acc["email"] not in _fallback_users:
            acc["_id"] = f"usr_seed_{acc['role']}"
            _fallback_users[acc["email"]] = acc
    _save_fallback_users()

def _load_fallback_users():
    global _fallback_users
    if os.path.exists(FALLBACK_USERS_FILE):
        try:
            with open(FALLBACK_USERS_FILE, "r", encoding="utf-8") as f:
                _fallback_users = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load fallback users: {e}")
            _fallback_users = {}
    _seed_initial_users()

def _save_fallback_users():
    try:
        with open(FALLBACK_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(_fallback_users, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Could not save fallback users: {e}")

_load_fallback_users()

async def connect_db():
    global client, db, is_mongo_connected
    uri = get_mongo_uri()
    dbname = get_db_name()
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=8000)
        # Verify active connection to MongoDB Atlas
        info = await client.server_info()
        db = client[dbname]
        is_mongo_connected = True
        print(f"[OK] Successfully Connected to MongoDB Atlas cluster at '{dbname}' (MongoDB v{info.get('version')})")
        
        # Ensure collections exist and seed initial users into Atlas if empty
        user_count = await db.users.count_documents({})
        if user_count == 0:
            for email, u in _fallback_users.items():
                u_copy = dict(u)
                if "_id" in u_copy and isinstance(u_copy["_id"], str) and u_copy["_id"].startswith("usr_"):
                    del u_copy["_id"]
                await db.users.insert_one(u_copy)
            print("[Atlas] Seeded initial officer accounts into MongoDB Atlas 'users' collection.")
        else:
            print(f"[Atlas] MongoDB Atlas currently has {user_count} registered users.")
    except Exception as e:
        is_mongo_connected = False
        print(f"[Notice] MongoDB Atlas connection notice ({e}). Operating in resilient local mode.")

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
            print(f"MongoDB Atlas error in get_user_by_email: {e}")
    
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
            print(f"[Atlas] Saved new user '{clean_email}' to MongoDB Atlas (ID: {user_dict['_id']})")
            return user_dict
        except Exception as e:
            print(f"MongoDB Atlas error in create_user: {e}")
    
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
            print(f"MongoDB Atlas error in update_user: {e}")
    
    if clean_email in _fallback_users:
        _fallback_users[clean_email].update(update_fields)
        _save_fallback_users()
        return _fallback_users[clean_email]
    return None

# General logging / audit telemetry collection in Mongo Atlas
async def log_activity(activity_type: str, details: Dict[str, Any], user_email: Optional[str] = None):
    if is_mongo_connected and db is not None:
        try:
            record = {
                "activity_type": activity_type,
                "user_email": user_email,
                "details": details,
                "timestamp": datetime.utcnow().isoformat()
            }
            await db.audit_logs.insert_one(record)
        except Exception as e:
            print(f"MongoDB Atlas audit log notice: {e}")
