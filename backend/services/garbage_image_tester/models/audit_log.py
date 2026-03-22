"""
Audit Log Model

Represents a complete audit trail of all validation decisions for analysis and appeals.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from models.database import Base


class AuditLog(Base):
    """
    Model for audit logging of all validation decisions.
    
    Stores complete records of every submission attempt including AI responses,
    decisions, and raw model output for system analysis and retraining.
    """
    __tablename__ = "audit_logs"
    
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    address = Column(String, nullable=False, index=True)
    image_hash = Column(String(64), nullable=False, index=True)  # SHA256 hash
    ai_label = Column(String, nullable=False)
    ai_confidence = Column(Float, nullable=False)
    ai_reason = Column(String, nullable=False)
    decision = Column(String, nullable=False, index=True)  # accepted, rejected, pending_review
    model_response_raw = Column(Text, nullable=False)  # Raw JSON response from AI model
    
    def __repr__(self):
        return f"<AuditLog(id={self.log_id}, decision='{self.decision}', confidence={self.ai_confidence})>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            "log_id": str(self.log_id),
            "timestamp": self.timestamp.isoformat(),
            "address": self.address,
            "image_hash": self.image_hash,
            "ai_label": self.ai_label,
            "ai_confidence": self.ai_confidence,
            "ai_reason": self.ai_reason,
            "decision": self.decision,
            "model_response_raw": self.model_response_raw
        }
