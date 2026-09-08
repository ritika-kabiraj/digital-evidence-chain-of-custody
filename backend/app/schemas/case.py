from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserOut

class CaseBase(BaseModel):
    case_number: str
    title: str
    description: Optional[str] = None
    status: Optional[str] = "OPEN"

class CaseCreate(CaseBase):
    lead_investigator_id: Optional[str] = None

class CaseOut(CaseBase):
    id: str
    created_by_id: str
    lead_investigator_id: Optional[str] = None
    created_by: Optional[UserOut] = None
    lead_investigator: Optional[UserOut] = None
    evidence_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
