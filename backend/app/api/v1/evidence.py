import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Evidence, Case, User
from app.schemas.evidence import EvidenceOut
from app.core.rbac import get_current_user, require_roles
from app.core.hashing import calculate_sha256_from_bytes
from app.services.storage_service import storage_service
from app.services.blockchain_service import blockchain_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.post("/upload", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    request: Request,
    case_id: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form("OTHER"),
    custodian_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "LEAD_INVESTIGATOR", "FORENSIC_ANALYST"]))
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' not found")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file cannot be empty")

    # 1. Calculate SHA-256 hash
    sha256_hash = calculate_sha256_from_bytes(file_bytes)
    evidence_id = str(uuid.uuid4())
    evidence_number = f"EVD-{datetime.datetime.now().strftime('%Y%m%d')}-{evidence_id[:6].upper()}"

    # 2. Store off-chain in local vault
    storage_path = storage_service.save_evidence_file(
        case_id=case_id,
        evidence_id=evidence_id,
        original_filename=file.filename,
        file_bytes=file_bytes
    )

    custodian = custodian_id or current_user.id
    custodian_user = db.query(User).filter(User.id == custodian).first()
    custodian_wallet = custodian_user.wallet_address if custodian_user else current_user.wallet_address

    # 3. Register evidence hash & metadata on local Ethereum blockchain
    bc_result = blockchain_service.register_evidence_on_chain(
        evidence_id_str=evidence_id,
        case_number=case.case_number,
        sha256_hash=sha256_hash,
        storage_ref=f"/vault/cases/{case_id}/{evidence_id}",
        custodian_wallet=custodian_wallet
    )

    # 4. Save metadata record to DB
    new_evidence = Evidence(
        id=evidence_id,
        evidence_number=evidence_number,
        case_id=case_id,
        title=title,
        description=description,
        category=category,
        sha256_hash=sha256_hash,
        file_name=file.filename,
        file_size_bytes=len(file_bytes),
        mime_type=file.content_type or "application/octet-stream",
        storage_path=storage_path,
        current_custodian_id=custodian,
        status="LOGGED",
        blockchain_tx_hash=bc_result.get("tx_hash"),
        blockchain_block_number=bc_result.get("block_number"),
        smart_contract_evidence_id=bc_result.get("evidence_id_bytes32"),
        is_verified=True
    )
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)

    # 5. Record Audit Log
    audit_service.log_action(
        db=db,
        action="EVIDENCE_UPLOADED",
        user_id=current_user.id,
        resource_type="EVIDENCE",
        resource_id=new_evidence.id,
        ip_address=request.client.host if request.client else None,
        details={
            "evidence_number": evidence_number,
            "sha256_hash": sha256_hash,
            "tx_hash": bc_result.get("tx_hash"),
            "file_name": file.filename
        }
    )

    return new_evidence

@router.get("", response_model=List[EvidenceOut])
def list_evidence(
    case_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Evidence)
    if case_id:
        query = query.filter(Evidence.case_id == case_id)
    return query.all()

@router.get("/{evidence_id}", response_model=EvidenceOut)
def get_evidence(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    return evidence

@router.get("/{evidence_id}/download")
def download_evidence(
    evidence_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    audit_service.log_action(
        db=db,
        action="EVIDENCE_FILE_DOWNLOADED",
        user_id=current_user.id,
        resource_type="EVIDENCE",
        resource_id=evidence.id,
        ip_address=request.client.host if request.client else None,
        details={"file_name": evidence.file_name}
    )

    return FileResponse(
        path=evidence.storage_path,
        filename=evidence.file_name,
        media_type=evidence.mime_type
    )
