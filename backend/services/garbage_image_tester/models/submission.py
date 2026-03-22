"""
Submission Model

Represents an accepted garbage report submission with validated image and metadata.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from models.database import Base


class Submission(Base):
    """
    Model for accepted submissions that have passed AI validation.
    
    Stores permanent records of validated garbage reports with image metadata
    and AI classification results.
    """
    __tablename__ = "submissions"
    
    submission_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    image_hash = Column(String(64), nullable=False, index=True)  # SHA256 hash
    blob_path = Column(String, nullable=False)
    ai_label = Column(String, nullable=False)
    ai_confidence = Column(Float, nullable=False)
    ai_reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="accepted", index=True)
    
    def __repr__(self):
        return f"<Submission(id={self.submission_id}, address='{self.address}', status='{self.status}')>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            "submission_id": str(self.submission_id),
            "address": self.address,
            "timestamp": self.timestamp.isoformat(),
            "image_hash": self.image_hash,
            "blob_path": self.blob_path,
            "ai_label": self.ai_label,
            "ai_confidence": self.ai_confidence,
            "ai_reason": self.ai_reason,
            "status": self.status
        }
