"""
Review Queue Item Model

Represents submissions flagged for manual admin review due to ambiguous AI confidence scores.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from models.database import Base


class ReviewQueueItem(Base):
    """
    Model for submissions requiring manual review.
    
    Stores submissions with confidence scores between 0.50-0.75 that need
    human verification before final acceptance or rejection.
    """
    __tablename__ = "review_queue"
    
    review_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    image_hash = Column(String(64), nullable=False, index=True)  # SHA256 hash
    temp_blob_path = Column(String, nullable=False)
    ai_label = Column(String, nullable=False)
    ai_confidence = Column(Float, nullable=False)
    ai_reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending_review", index=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_decision = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<ReviewQueueItem(id={self.review_id}, address='{self.address}', status='{self.status}')>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            "review_id": str(self.review_id),
            "address": self.address,
            "timestamp": self.timestamp.isoformat(),
            "image_hash": self.image_hash,
            "temp_blob_path": self.temp_blob_path,
            "ai_label": self.ai_label,
            "ai_confidence": self.ai_confidence,
            "ai_reason": self.ai_reason,
            "status": self.status,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "admin_decision": self.admin_decision
        }
