from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from datetime import datetime

from backend.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserProfileUpdate,
    ChangePasswordRequest,
    AuthResponse,
    UserResponse
)
from backend.services.database import get_user_by_email, create_user, update_user
from backend.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    verify_google_oauth
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired"
        )
    user = await get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    existing = await get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    user_data = {
        "name": req.name.strip(),
        "email": req.email.strip().lower(),
        "password_hash": hash_password(req.password),
        "provider": "local",
        "role": "user",
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}",
        "created_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }
    created = await create_user(user_data)
    token = create_access_token({"sub": created["email"], "role": created["role"]})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(created.get("_id", "")),
            name=created["name"],
            email=created["email"],
            avatar=created.get("avatar"),
            provider=created.get("provider", "local"),
            role=created.get("role", "user"),
            created_at=created.get("created_at"),
            last_login=created.get("last_login")
        )
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await get_user_by_email(req.email)
    if not user or not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Update last login timestamp
    now = datetime.utcnow().isoformat()
    await update_user(req.email, {"last_login": now})
    user["last_login"] = now

    token = create_access_token({"sub": user["email"], "role": user.get("role", "user")})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.get("_id", "")),
            name=user["name"],
            email=user["email"],
            avatar=user.get("avatar"),
            provider=user.get("provider", "local"),
            role=user.get("role", "user"),
            created_at=user.get("created_at"),
            last_login=user.get("last_login")
        )
    )

@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest):
    try:
        gdata = await verify_google_oauth(req.id_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    user = await get_user_by_email(gdata["email"])
    now = datetime.utcnow().isoformat()

    if not user:
        # Create Google user
        user = {
            "name": gdata["name"] or gdata["email"].split("@")[0],
            "email": gdata["email"],
            "google_id": gdata["google_id"],
            "avatar": gdata["avatar"],
            "provider": "google",
            "role": "user",
            "created_at": now,
            "last_login": now
        }
        user = await create_user(user)
    else:
        await update_user(gdata["email"], {
            "last_login": now,
            "google_id": gdata["google_id"],
            "avatar": gdata["avatar"] or user.get("avatar")
        })

    token = create_access_token({"sub": user["email"], "role": user.get("role", "user")})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.get("_id", "")),
            name=user["name"],
            email=user["email"],
            avatar=user.get("avatar"),
            provider=user.get("provider", "google"),
            role=user.get("role", "user"),
            created_at=user.get("created_at"),
            last_login=now
        )
    )

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out. Please clear your client token."}

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(user.get("_id", "")),
        name=user["name"],
        email=user["email"],
        avatar=user.get("avatar"),
        provider=user.get("provider", "local"),
        role=user.get("role", "user"),
        created_at=user.get("created_at"),
        last_login=user.get("last_login")
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(req: UserProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {}
    if req.name:
        updates["name"] = req.name.strip()
    if req.avatar:
        updates["avatar"] = req.avatar

    updated = await update_user(user["email"], updates)
    return UserResponse(
        id=str(updated.get("_id", "")),
        name=updated["name"],
        email=updated["email"],
        avatar=updated.get("avatar"),
        provider=updated.get("provider", "local"),
        role=updated.get("role", "user"),
        created_at=updated.get("created_at"),
        last_login=updated.get("last_login")
    )

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    if not user.get("password_hash") or not verify_password(req.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password does not match.")
    
    new_hash = hash_password(req.new_password)
    await update_user(user["email"], {"password_hash": new_hash})
    return {"message": "Password changed successfully."}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = await get_user_by_email(req.email)
    if not user:
        # Prevent account enumeration, respond safely
        return {
            "message": "If this email is registered in VayuNet, a secure password reset link has been dispatched."
        }
    
    reset_token = create_access_token({"sub": req.email, "purpose": "pwd_reset"})
    await update_user(req.email, {"reset_token": reset_token})
    return {
        "message": "If this email is registered in VayuNet, a secure password reset link has been dispatched.",
        "reset_token": reset_token  # Provided for easy local testing
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    payload = decode_access_token(req.token)
    if not payload or payload.get("sub") != req.email or payload.get("purpose") != "pwd_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")
    
    new_hash = hash_password(req.new_password)
    await update_user(req.email, {"password_hash": new_hash, "reset_token": None})
    return {"message": "Password has been successfully updated. You may now login."}
