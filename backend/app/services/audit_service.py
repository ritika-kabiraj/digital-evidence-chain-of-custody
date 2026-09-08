from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.db.models import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            details=details or {}
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

audit_service = AuditService()
