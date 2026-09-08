from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Role
from app.schemas.user import UserOut, UserCreate
from app.core.security import get_password_hash
from app.core.rbac import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active users (for assigning lead investigators and custodians)."""
    return db.query(User).filter(User.is_active == True).all()

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role_id=user_in.role_id,
        wallet_address=user_in.wallet_address,
        badge_number=user_in.badge_number,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
