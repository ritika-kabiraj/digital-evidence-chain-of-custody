from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserOut

class CustodyTransferCreate(BaseModel):
    evidence_id: str
    to_user_id: str
    reason: str
    location: str

class CustodyTransferOut(BaseModel):
    id: str
    evidence_id: str
    from_user_id: str
    to_user_id: str
    reason: str
    location: str
    status: str
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    transferred_at: datetime
    from_user: Optional[UserOut] = None
    to_user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class CombinedCustodyLog(BaseModel):
    source: str # "DATABASE" or "BLOCKCHAIN"
    from_address_or_name: str
    to_address_or_name: str
    reason: str
    location: str
    timestamp: str
    tx_hash: Optional[str] = None
