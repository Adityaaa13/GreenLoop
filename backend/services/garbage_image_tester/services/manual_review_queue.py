"""
Manual Review Queue Service

Handles storage and retrieval of ambiguous submissions requiring manual admin review.
"""

import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from models.database import SessionLocal
from models.review_queue import ReviewQueueItem

# Load environment variables
load_dotenv()


class ManualReviewQueue:
    """
    Manages the manual review queue for ambiguous submissions.
    
    Responsibilities:
    - Store ambiguous submissions (0.50-0.75 confidence) to temporary blob storage
    - Persist review queue metadata to database
    - Provide admin access to pending reviews
    """
    
    def __init__(self, temp_blob_storage_path: Optional[str] = None):
        """
        Initialize ManualReviewQueue with temporary blob storage configuration.
        
        Args:
            temp_blob_storage_path: Path to temporary blob storage directory.
                                   Defaults to TEMP_BLOB_STORAGE_PATH env var or './storage/temp_blobs'
        """
        self.temp_blob_storage_path = temp_blob_storage_path or os.getenv(
            "TEMP_BLOB_STORAGE_PATH",
            "./storage/temp_blobs"
        )
        
        # Ensure temporary blob storage directory exists
        Path(self.temp_blob_storage_path).mkdir(parents=True, exist_ok=True)
    
    def add_to_queue(
        self,
        image_bytes: bytes,
        address: str,
        ai_label: str,
        ai_confidence: float,
        ai_reason: str
    ) -> str:
        """
        Add an ambiguous submission to the manual review queue.
        
        Args:
            image_bytes: Raw image file bytes
            address: Address of the reported untidy area
            ai_label: AI classification label (typically "valid" for ambiguous cases)
            ai_confidence: AI confidence score (0.50-0.75 range)
            ai_reason: AI reasoning for the classification
        
        Returns:
            str: Unique review_id (UUID as string)
        
        Raises:
            Exception: If storage fails
        """
        # Generate unique review ID
        review_id = uuid.uuid4()
        
        # Compute SHA256 hash of image
        image_hash = self._compute_hash(image_bytes)
        
        # Store image to temporary blob storage
        temp_blob_path = self._store_temp_blob(image_bytes, review_id)
        
        # Store review metadata to database
        self._store_review_metadata(
            review_id=review_id,
            address=address,
            image_hash=image_hash,
            temp_blob_path=temp_blob_path,
            ai_label=ai_label,
            ai_confidence=ai_confidence,
            ai_reason=ai_reason
        )
        
        return str(review_id)
    
    def get_pending_reviews(self) -> List[dict]:
        """
        Retrieve all submissions awaiting manual review.
        
        Returns:
            List[dict]: List of pending review items as dictionaries
        """
        db: Session = SessionLocal()
        try:
            # Query all items with status "pending_review"
            pending_items = db.query(ReviewQueueItem).filter(
                ReviewQueueItem.status == "pending_review"
            ).order_by(ReviewQueueItem.timestamp.asc()).all()
            
            # Convert to dictionaries for JSON serialization
            return [item.to_dict() for item in pending_items]
        finally:
            db.close()
    
    def _compute_hash(self, image_bytes: bytes) -> str:
        """
        Compute SHA256 hash of image bytes.
        
        Args:
            image_bytes: Raw image file bytes
        
        Returns:
            str: Hexadecimal SHA256 hash
        """
        return hashlib.sha256(image_bytes).hexdigest()
    
    def _store_temp_blob(self, image_bytes: bytes, review_id: uuid.UUID) -> str:
        """
        Store image bytes to temporary blob storage filesystem.
        
        Args:
            image_bytes: Raw image file bytes
            review_id: Unique review identifier
        
        Returns:
            str: Relative path to stored temporary blob
        
        Raises:
            IOError: If file write fails
        """
        # Create filename using review_id
        filename = f"{review_id}.jpg"
        temp_blob_path = os.path.join(self.temp_blob_storage_path, filename)
        
        # Write image bytes to file
        with open(temp_blob_path, 'wb') as f:
            f.write(image_bytes)
        
        # Return relative path for database storage
        return temp_blob_path
    
    def _store_review_metadata(
        self,
        review_id: uuid.UUID,
        address: str,
        image_hash: str,
        temp_blob_path: str,
        ai_label: str,
        ai_confidence: float,
        ai_reason: str
    ) -> None:
        """
        Store review queue metadata to database.
        
        Args:
            review_id: Unique review identifier
            address: Address of the reported untidy area
            image_hash: SHA256 hash of the image
            temp_blob_path: Path to stored temporary blob
            ai_label: AI classification label
            ai_confidence: AI confidence score
            ai_reason: AI reasoning for the classification
        
        Raises:
            Exception: If database operation fails
        """
        db: Session = SessionLocal()
        try:
            review_item = ReviewQueueItem(
                review_id=review_id,
                address=address,
                timestamp=datetime.utcnow(),
                image_hash=image_hash,
                temp_blob_path=temp_blob_path,
                ai_label=ai_label,
                ai_confidence=ai_confidence,
                ai_reason=ai_reason,
                status="pending_review"
            )
            
            db.add(review_item)
            db.commit()
            db.refresh(review_item)
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to store review queue metadata: {str(e)}")
        finally:
            db.close()
