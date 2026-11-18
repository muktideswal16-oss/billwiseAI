"""
BillWise AI — Authentication & Security Module
Provides password hashing via direct bcrypt, JWT token generation/validation via PyJWT,
and FastAPI dependencies for user authentication and authorization.
"""

import datetime
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidTokenError
import bcrypt
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User

# --------------- Password Hashing (Direct Bcrypt) ---------------

def hash_password(password: str) -> str:
    """Return a secure bcrypt hash of the plain-text password."""
    # Truncate to 72 bytes as required by bcrypt specification
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verify a plain-text password against a bcrypt hash."""
    if not hashed_password or not plain_password:
        return False
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


# --------------- JWT Token Generation & Validation ---------------

security_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: int, email: str, role: str = "Owner") -> str:
    """Create a signed JWT token containing user identity and expiration."""
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        hours=settings.JWT_EXPIRATION_HOURS
    )
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and cryptographically verify a JWT. Returns payload dict or None."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except (ExpiredSignatureError, InvalidTokenError, PyJWTError):
        return None
    except Exception:
        return None


# --------------- FastAPI Dependency for Protected Endpoints ---------------

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and verifies Bearer token,
    retrieves the active user from the database, or raises HTTP 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials or not credentials.credentials:
        raise credentials_exception

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        uid = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise credentials_exception

    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    FastAPI dependency that returns the authenticated User if valid Bearer token provided,
    or None if unauthenticated (allowing demo/fallback mode without breaking).
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        uid = int(user_id)
        return db.query(User).filter(User.id == uid).first()
    except Exception:
        return None
