from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime
from app.schemas.user import UserOut

class EvidenceBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "OTHER"

class EvidenceCreate(EvidenceBase):
    case_id: str
    custodian_id: Optional[str] = None

class EvidenceOut(EvidenceBase):
    id: str
    evidence_number: str
    case_id: str
    sha256_hash: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    storage_path: str
    current_custodian_id: str
    current_custodian: Optional[UserOut] = None
    status: str
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None
    smart_contract_evidence_id: Optional[str] = None
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IntegrityVerificationResult(BaseModel):
    evidence_id: str
    evidence_number: str
    calculated_hash: str
    db_hash: str
    blockchain_hash: Optional[str] = None
    db_match: bool
    blockchain_match: bool
    is_fully_tamper_free: bool
    status: str
    verified_at: datetime
