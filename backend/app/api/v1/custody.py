from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Evidence, CustodyTransfer, User
from app.schemas.custody import CustodyTransferCreate, CustodyTransferOut, CombinedCustodyLog
from app.core.rbac import get_current_user, require_roles
from app.services.blockchain_service import blockchain_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/custody", tags=["Chain of Custody"])

@router.post("/transfer", response_model=CustodyTransferOut, status_code=status.HTTP_201_CREATED)
def initiate_transfer(
    transfer_in: CustodyTransferCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "LEAD_INVESTIGATOR", "FORENSIC_ANALYST", "CUSTODIAN"]))
):
    evidence = db.query(Evidence).filter(Evidence.id == transfer_in.evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if evidence.current_custodian_id != current_user.id and current_user.role.name != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only the current evidence custodian or an admin can initiate a transfer"
        )

    to_user = db.query(User).filter(User.id == transfer_in.to_user_id).first()
    if not to_user:
        raise HTTPException(status_code=404, detail="Target recipient user not found")

    # 1. Execute transaction on local smart contract
    bc_result = blockchain_service.transfer_custody_on_chain(
        evidence_id_str=evidence.id,
        to_custodian_wallet=to_user.wallet_address or "",
        reason=transfer_in.reason,
        location=transfer_in.location
    )

    # 2. Update evidence record in DB
    prev_custodian_id = evidence.current_custodian_id
    evidence.current_custodian_id = to_user.id
    evidence.status = "TRANSFERRED"

    # 3. Save transfer history log
    transfer_record = CustodyTransfer(
        evidence_id=evidence.id,
        from_user_id=prev_custodian_id,
        to_user_id=to_user.id,
        reason=transfer_in.reason,
        location=transfer_in.location,
        status="ACCEPTED", # Instant verified transfer
        tx_hash=bc_result.get("tx_hash"),
        block_number=bc_result.get("block_number"),
        transferred_at=datetime.now(timezone.utc)
    )
    db.add(transfer_record)
    db.commit()
    db.refresh(transfer_record)

    # 4. Audit Log
    audit_service.log_action(
        db=db,
        action="CUSTODY_TRANSFERRED",
        user_id=current_user.id,
        resource_type="EVIDENCE",
        resource_id=evidence.id,
        ip_address=request.client.host if request.client else None,
        details={
            "from_user": current_user.email,
            "to_user": to_user.email,
            "reason": transfer_in.reason,
            "tx_hash": bc_result.get("tx_hash")
        }
    )

    return transfer_record

@router.get("/{evidence_id}/history", response_model=List[CustodyTransferOut])
def get_custody_history(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    transfers = db.query(CustodyTransfer).filter(CustodyTransfer.evidence_id == evidence_id).order_by(CustodyTransfer.transferred_at.asc()).all()
    return transfers
