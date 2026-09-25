import os
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET", "vayunet_secret_key_prod_2026_secure_hash_898231")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

def hash_password(password: str) -> str:
    """Secure SHA-256 salted password hashing."""
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salt$hash format."""
    try:
        if "$" not in hashed_password:
            return False
        salt, expected_hash = hashed_password.split("$", 1)
        test_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
        return hmac.compare_digest(test_hash, expected_hash)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def verify_google_oauth(id_token: str) -> Dict[str, Any]:
    """
    Real Google OAuth verification.
    If GOOGLE_CLIENT_ID is not configured, it raises a helpful exception indicating configuration is required.
    """
    if not GOOGLE_CLIENT_ID:
        raise ValueError(
            "GOOGLE_CLIENT_ID is not configured in backend environment. "
            "Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
        )

    import urllib.request
    import json
    
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            payload = json.loads(response.read().decode('utf-8'))
            
            # Verify aud matches our Client ID
            if payload.get("aud") != GOOGLE_CLIENT_ID:
                raise ValueError("Google OAuth token audience does not match GOOGLE_CLIENT_ID.")
                
            return {
                "google_id": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name", ""),
                "avatar": payload.get("picture", ""),
                "email_verified": payload.get("email_verified", False)
            }
    except Exception as e:
        raise ValueError(f"Failed to verify Google token: {str(e)}")
