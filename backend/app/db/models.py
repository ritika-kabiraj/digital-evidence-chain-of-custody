import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, BigInteger, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    wallet_address = Column(String(42), nullable=True, index=True)
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="users")
    cases_created = relationship("Case", foreign_keys="Case.created_by_id", back_populates="created_by")
    cases_led = relationship("Case", foreign_keys="Case.lead_investigator_id", back_populates="lead_investigator")
    custody_evidence = relationship("Evidence", back_populates="current_custodian")
    transfers_sent = relationship("CustodyTransfer", foreign_keys="CustodyTransfer.from_user_id", back_populates="from_user")
    transfers_received = relationship("CustodyTransfer", foreign_keys="CustodyTransfer.to_user_id", back_populates="to_user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    lead_investigator_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="OPEN") # OPEN, UNDER_INVESTIGATION, CLOSED, ARCHIVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="cases_created")
    lead_investigator = relationship("User", foreign_keys=[lead_investigator_id], back_populates="cases_led")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_number = Column(String(100), unique=True, nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="OTHER") # DISK_IMAGE, NETWORK_CAPTURE, DOCUMENT, MEMORY_DUMP, MOBILE_EXTRACTION, OTHER
    sha256_hash = Column(String(64), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), default="application/octet-stream")
    storage_path = Column(String(500), nullable=False)
    current_custodian_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="LOGGED") # LOGGED, IN_CUSTODY, TRANSFERRED, ANALYSIS, PRODUCED_IN_COURT, DISPOSED, COMPROMISED
    blockchain_tx_hash = Column(String(66), nullable=True)
    blockchain_block_number = Column(BigInteger, nullable=True)
    smart_contract_evidence_id = Column(String(66), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="evidence_items")
    current_custodian = relationship("User", back_populates="custody_evidence")
    transfers = relationship("CustodyTransfer", back_populates="evidence", cascade="all, delete-orphan")

class CustodyTransfer(Base):
    __tablename__ = "custody_transfers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_id = Column(String(36), ForeignKey("evidence.id"), nullable=False)
    from_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    to_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, ACCEPTED, REJECTED, CANCELLED
    tx_hash = Column(String(66), nullable=True)
    block_number = Column(BigInteger, nullable=True)
    transferred_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    evidence = relationship("Evidence", back_populates="transfers")
    from_user = relationship("User", foreign_keys=[from_user_id], back_populates="transfers_sent")
    to_user = relationship("User", foreign_keys=[to_user_id], back_populates="transfers_received")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
