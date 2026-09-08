import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Evidence Integrity System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "CYBER_SECURITY_DIGITAL_EVIDENCE_SUPER_SECRET_KEY_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Database configuration (Defaults to SQLite for local development, easily switches to PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./digital_evidence.db"
    )

    # Local Evidence Storage Vault
    STORAGE_VAULT_DIR: str = os.getenv(
        "STORAGE_VAULT_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../storage/vault"))
    )

    # Web3 / Blockchain config
    BLOCKCHAIN_RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
    CHAIN_ID: int = int(os.getenv("CHAIN_ID", "31337"))
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")

    class Config:
        case_sensitive = True

settings = Settings()
