from fastapi import APIRouter
from app.api.v1 import auth, users, cases, evidence, custody, verification, audit

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(cases.router)
api_router.include_router(evidence.router)
api_router.include_router(custody.router)
api_router.include_router(verification.router)
api_router.include_router(audit.router)
