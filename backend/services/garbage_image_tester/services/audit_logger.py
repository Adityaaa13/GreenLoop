"""
Audit Logger Service

Handles logging of all validation decisions for analysis, appeals, and system retraining.
"""

import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from models.database import SessionLocal
from models.audit_log import AuditLog


class AuditLogger:
    """
    Manages audit logging of all validation decisions.
    
    Responsibilities:
    - Log all validation decisions (accepted, rejected, pending_review)
    - Store complete model output including label, confidence, and reason
    - Store image hash and submission timestamp
    - Store raw model response JSON for analysis and retraining
    """
    
    def __init__(self):
        """
        Initialize AuditLogger.
        
        No configuration needed as all data is stored in the database.
        """
        pass
    
    def log_decision(
        self,
        address: str,
        image_hash: str,
        ai_label: str,
        ai_confidence: float,
        ai_reason: str,
        decision: str,
        model_response_raw: dict,
        timestamp: Optional[datetime] = None
    ) -> str:
        """
        Log a validation decision to the audit log.
        
        Args:
            address: Address of the reported untidy area
            image_hash: SHA256 hash of the submitted image
            ai_label: AI classification label ("valid" or "invalid")
            ai_confidence: AI confidence score (0.00-1.00)
            ai_reason: AI reasoning for the classification
            decision: Final decision made ("accepted", "rejected", or "pending_review")
            model_response_raw: Complete raw response from AI model as dictionary
            timestamp: Optional timestamp (defaults to current UTC time)
        
        Returns:
            str: Unique log_id (UUID as string)
        
        Raises:
            Exception: If database operation fails
        """
        db: Session = SessionLocal()
        try:
            # Convert model response dictionary to JSON string
            model_response_json = json.dumps(model_response_raw)
            
            # Create audit log entry
            audit_log = AuditLog(
                timestamp=timestamp or datetime.utcnow(),
                address=address,
                image_hash=image_hash,
                ai_label=ai_label,
                ai_confidence=ai_confidence,
                ai_reason=ai_reason,
                decision=decision,
                model_response_raw=model_response_json
            )
            
            db.add(audit_log)
            db.commit()
            db.refresh(audit_log)
            
            return str(audit_log.log_id)
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to log audit decision: {str(e)}")
        finally:
            db.close()
