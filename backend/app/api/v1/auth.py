from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Role
from app.core.security import verify_password, create_access_token, get_password_hash
from app.schemas.user import Token, UserOut, UserCreate, LoginRequest
from app.services.audit_service import audit_service
from app.core.rbac import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        audit_service.log_action(
            db=db,
            action="USER_LOGIN_FAILED",
            ip_address=request.client.host if request.client else None,
            details={"email": login_data.email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    role_name = user.role.name if user.role else ""
    token = create_access_token(
        subject=user.id,
        role=role_name,
        wallet_address=user.wallet_address or ""
    )

    audit_service.log_action(
        db=db,
        action="USER_LOGIN_SUCCESS",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        details={"email": user.email, "role": role_name}
    )

    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/form-login", response_model=Token)
def form_login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None, db: Session = Depends(get_db)):
    """FastAPI OAuth2 Form compatibility login."""
    return login(LoginRequest(email=form_data.username, password=form_data.password), request, db)

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
