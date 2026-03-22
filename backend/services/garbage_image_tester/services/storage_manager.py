"""
Storage Manager Service

Handles persistent storage of accepted submissions including blob storage for images
and database storage for metadata.
"""

import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from models.database import SessionLocal
from models.submission import Submission

# Load environment variables
load_dotenv()


class StorageManager:
    """
    Manages storage of accepted submissions.
    
    Responsibilities:
    - Store image files to blob storage (filesystem)
    - Generate unique submission IDs
    - Compute SHA256 hashes of images
    - Persist submission metadata to database
    """
    
    def __init__(self, blob_storage_path: Optional[str] = None):
        """
        Initialize StorageManager with blob storage configuration.
        
        Args:
            blob_storage_path: Path to blob storage directory. 
                             Defaults to BLOB_STORAGE_PATH env var or './storage/blobs'
        """
        self.blob_storage_path = blob_storage_path or os.getenv(
            "BLOB_STORAGE_PATH", 
            "./storage/blobs"
        )
        
        # Ensure blob storage directory exists
        Path(self.blob_storage_path).mkdir(parents=True, exist_ok=True)
    
    def store_submission(
        self, 
        image_bytes: bytes, 
        address: str,
        ai_label: str,
        ai_confidence: float,
        ai_reason: str
    ) -> str:
        """
        Store an accepted submission with image and metadata.
        
        Args:
            image_bytes: Raw image file bytes
            address: Address of the reported untidy area
            ai_label: AI classification label ("valid" or "invalid")
            ai_confidence: AI confidence score (0.00-1.00)
            ai_reason: AI reasoning for the classification
        
        Returns:
            str: Unique submission_id (UUID as string)
        
        Raises:
            Exception: If storage fails
        """
        # Generate unique submission ID
        submission_id = uuid.uuid4()
        
        # Compute SHA256 hash of image
        image_hash = self._compute_hash(image_bytes)
        
        # Store image to blob storage
        blob_path = self._store_blob(image_bytes, submission_id)
        
        # Store metadata to database
        self._store_metadata(
            submission_id=submission_id,
            address=address,
            image_hash=image_hash,
            blob_path=blob_path,
            ai_label=ai_label,
            ai_confidence=ai_confidence,
            ai_reason=ai_reason
        )
        
        return str(submission_id)
    
    def _compute_hash(self, image_bytes: bytes) -> str:
        """
        Compute SHA256 hash of image bytes.
        
        Args:
            image_bytes: Raw image file bytes
        
        Returns:
            str: Hexadecimal SHA256 hash
        """
        return hashlib.sha256(image_bytes).hexdigest()
    
    def _store_blob(self, image_bytes: bytes, submission_id: uuid.UUID) -> str:
        """
        Store image bytes to blob storage filesystem.
        
        Args:
            image_bytes: Raw image file bytes
            submission_id: Unique submission identifier
        
        Returns:
            str: Relative path to stored blob
        
        Raises:
            IOError: If file write fails
        """
        # Create filename using submission_id
        filename = f"{submission_id}.jpg"
        blob_path = os.path.join(self.blob_storage_path, filename)
        
        # Write image bytes to file
        with open(blob_path, 'wb') as f:
            f.write(image_bytes)
        
        # Return relative path for database storage
        return blob_path
    
    def _store_metadata(
        self,
        submission_id: uuid.UUID,
        address: str,
        image_hash: str,
        blob_path: str,
        ai_label: str,
        ai_confidence: float,
        ai_reason: str
    ) -> None:
        """
        Store submission metadata to database.
        
        Args:
            submission_id: Unique submission identifier
            address: Address of the reported untidy area
            image_hash: SHA256 hash of the image
            blob_path: Path to stored blob
            ai_label: AI classification label
            ai_confidence: AI confidence score
            ai_reason: AI reasoning for the classification
        
        Raises:
            Exception: If database operation fails
        """
        db: Session = SessionLocal()
        try:
            submission = Submission(
                submission_id=submission_id,
                address=address,
                timestamp=datetime.utcnow(),
                image_hash=image_hash,
                blob_path=blob_path,
                ai_label=ai_label,
                ai_confidence=ai_confidence,
                ai_reason=ai_reason,
                status="accepted"
            )
            
            db.add(submission)
            db.commit()
            db.refresh(submission)
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to store submission metadata: {str(e)}")
        finally:
            db.close()
