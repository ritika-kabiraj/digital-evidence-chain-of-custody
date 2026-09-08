from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Case, User, Evidence
from app.schemas.case import CaseOut, CaseCreate
from app.core.rbac import get_current_user, require_roles
from app.services.audit_service import audit_service

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("", response_model=List[CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cases = db.query(Case).all()
    for case in cases:
        case.evidence_count = len(case.evidence_items)
    return cases

@router.post("", response_model=CaseOut, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "LEAD_INVESTIGATOR"]))
):
    existing = db.query(Case).filter(Case.case_number == case_in.case_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Case number '{case_in.case_number}' already exists.")

    lead_id = case_in.lead_investigator_id or current_user.id

    new_case = Case(
        case_number=case_in.case_number,
        title=case_in.title,
        description=case_in.description,
        created_by_id=current_user.id,
        lead_investigator_id=lead_id,
        status=case_in.status or "OPEN"
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    audit_service.log_action(
        db=db,
        action="CASE_CREATED",
        user_id=current_user.id,
        resource_type="CASE",
        resource_id=new_case.id,
        ip_address=request.client.host if request.client else None,
        details={"case_number": new_case.case_number, "title": new_case.title}
    )

    new_case.evidence_count = 0
    return new_case

@router.get("/{case_id}", response_model=CaseOut)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.evidence_count = len(case.evidence_items)
    return case
