import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Evidence, User
from app.schemas.evidence import IntegrityVerificationResult
from app.core.rbac import get_current_user
from app.core.hashing import calculate_sha256_from_bytes
from app.services.blockchain_service import blockchain_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/verification", tags=["Integrity Verification"])

@router.post("/verify-file", response_model=IntegrityVerificationResult)
async def verify_evidence_file(
    request: Request,
    evidence_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail=f"Evidence record '{evidence_id}' not found")

    file_bytes = await file.read()
    calculated_hash = calculate_sha256_from_bytes(file_bytes)

    # 1. Compare with DB Hash
    db_hash = evidence.sha256_hash
    db_match = (calculated_hash.lower() == db_hash.lower())

    # 2. Compare with Blockchain Hash
    on_chain_record = blockchain_service.get_on_chain_evidence(evidence.id)
    blockchain_hash = on_chain_record.get("sha256Hash") if on_chain_record else db_hash
    blockchain_match = (calculated_hash.lower() == blockchain_hash.lower()) if blockchain_hash else db_match

    is_fully_tamper_free = db_match and blockchain_match
    verification_status = "TAMPER_FREE_VERIFIED" if is_fully_tamper_free else "TAMPER_ALERT_HASH_MISMATCH"

    # Update evidence record verification status
    evidence.is_verified = is_fully_tamper_free
    if not is_fully_tamper_free:
        evidence.status = "COMPROMISED"
    db.commit()

    # Log audit event
    audit_action = "EVIDENCE_VERIFICATION_SUCCESS" if is_fully_tamper_free else "EVIDENCE_VERIFICATION_TAMPER_DETECTED"
    audit_service.log_action(
        db=db,
        action=audit_action,
        user_id=current_user.id,
        resource_type="EVIDENCE",
        resource_id=evidence.id,
        ip_address=request.client.host if request.client else None,
        details={
            "evidence_number": evidence.evidence_number,
            "calculated_hash": calculated_hash,
            "expected_db_hash": db_hash,
            "expected_blockchain_hash": blockchain_hash,
            "is_fully_tamper_free": is_fully_tamper_free
        }
    )

    return IntegrityVerificationResult(
        evidence_id=evidence.id,
        evidence_number=evidence.evidence_number,
        calculated_hash=calculated_hash,
        db_hash=db_hash,
        blockchain_hash=blockchain_hash,
        db_match=db_match,
        blockchain_match=blockchain_match,
        is_fully_tamper_free=is_fully_tamper_free,
        status=verification_status,
        verified_at=datetime.datetime.now(datetime.timezone.utc)
    )

@router.get("/{evidence_id}/status")
def get_evidence_verification_status(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    on_chain = blockchain_service.get_on_chain_evidence(evidence.id)
    return {
        "evidence_id": evidence.id,
        "evidence_number": evidence.evidence_number,
        "db_hash": evidence.sha256_hash,
        "blockchain_hash": on_chain.get("sha256Hash") if on_chain else evidence.sha256_hash,
        "blockchain_tx_hash": evidence.blockchain_tx_hash,
        "is_verified": evidence.is_verified,
        "status": evidence.status
    }
