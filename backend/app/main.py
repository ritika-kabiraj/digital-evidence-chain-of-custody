from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.models import Role, User
from app.core.security import get_password_hash
from app.api.router import api_router
from app.services.blockchain_service import blockchain_service

# Create database tables automatically
Base.metadata.create_all(bind=engine)

def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Roles
        roles_data = [
            (1, "ADMIN", "System Administrator with full management access"),
            (2, "LEAD_INVESTIGATOR", "Lead Detective / Investigator managing cases"),
            (3, "FORENSIC_ANALYST", "Digital forensics technician analyzing and uploading evidence"),
            (4, "CUSTODIAN", "Evidence vault custodian managing physical & digital custody transfers"),
            (5, "AUDITOR", "Prosecutor / External legal auditor with verification and audit trail access"),
        ]
        for role_id, name, desc in roles_data:
            existing_role = db.query(Role).filter(Role.id == role_id).first()
            if not existing_role:
                db.add(Role(id=role_id, name=name, description=desc))
        db.commit()

        # Seed Demo Users if empty
        if db.query(User).count() == 0:
            demo_users = [
                {
                    "email": "admin@evidence.gov",
                    "password": "AdminPassword123!",
                    "full_name": "Chief Agent Sarah Connor",
                    "role_id": 1,
                    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", # Hardhat Account #0
                    "badge_number": "BADGE-001"
                },
                {
                    "email": "investigator@evidence.gov",
                    "password": "Investigator123!",
                    "full_name": "Detective Alex Vance",
                    "role_id": 2,
                    "wallet_address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", # Hardhat Account #1
                    "badge_number": "BADGE-104"
                },
                {
                    "email": "analyst@evidence.gov",
                    "password": "Analyst123!",
                    "full_name": "Forensic Specialist Maya Lin",
                    "role_id": 3,
                    "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", # Hardhat Account #2
                    "badge_number": "BADGE-309"
                },
                {
                    "email": "auditor@evidence.gov",
                    "password": "Auditor123!",
                    "full_name": "Prosecutor David Miller",
                    "role_id": 5,
                    "wallet_address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906", # Hardhat Account #3
                    "badge_number": "LEGAL-772"
                }
            ]
            for user_data in demo_users:
                db.add(User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    role_id=user_data["role_id"],
                    wallet_address=user_data["wallet_address"],
                    badge_number=user_data["badge_number"]
                ))
            db.commit()
    finally:
        db.close()

seed_initial_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "blockchain_connected": blockchain_service.is_connected()
    }

@app.get(f"{settings.API_V1_STR}/blockchain/status")
def get_blockchain_status():
    connected = blockchain_service.is_connected()
    block_number = None
    if connected:
        try:
            block_number = blockchain_service.w3.eth.block_number
        except Exception:
            pass
    return {
        "connected": connected,
        "rpc_url": settings.BLOCKCHAIN_RPC_URL,
        "contract_address": blockchain_service.contract_address,
        "current_block_number": block_number
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
