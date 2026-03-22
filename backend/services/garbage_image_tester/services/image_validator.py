"""
Image Validator Service

Validates uploaded image files for type and size constraints.
"""

from typing import Tuple, Optional
import io
from PIL import Image


class ImageValidator:
    """
    Validates image files before AI processing.
    
    Checks:
    - MIME type (JPEG, PNG, GIF, WebP)
    - File size (max 10MB)
    - Extracts image bytes
    """
    
    ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    MAX_SIZE_MB = 10
    MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024  # 10MB in bytes
    
    def validate_file(self, file_data: bytes, filename: Optional[str] = None) -> Tuple[bool, str, Optional[bytes]]:
        """
        Validates uploaded file for type and size.
        
        Args:
            file_data: Raw bytes of the uploaded file
            filename: Optional filename for additional validation
            
        Returns:
            Tuple of (is_valid, error_message, image_bytes)
            - is_valid: True if validation passes, False otherwise
            - error_message: Empty string if valid, error description if invalid
            - image_bytes: The validated image bytes if valid, None if invalid
        """
        # Check file size
        file_size = len(file_data)
        if file_size > self.MAX_SIZE_BYTES:
            return False, "Image too large", None
        
        if file_size == 0:
            return False, "Uploaded file is empty", None
        
        # Validate image format using PIL
        try:
            image = Image.open(io.BytesIO(file_data))
            image_format = image.format
            
            if image_format is None:
                return False, "Uploaded file is not an image", None
            
            # Check if format is allowed
            format_lower = image_format.lower()
            mime_type = f"image/{format_lower}"
            
            # Handle JPEG variations
            if format_lower == 'jpeg':
                mime_type = 'image/jpeg'
            
            if mime_type not in self.ALLOWED_FORMATS:
                return False, "Uploaded file is not an image", None
            
            # Verify image can be loaded (not corrupted)
            image.verify()
            
            # Return success with original bytes
            return True, "", file_data
            
        except (IOError, OSError, Image.UnidentifiedImageError) as e:
            return False, "Uploaded file is not an image", None
        except Exception as e:
            return False, f"Error processing image: {str(e)}", None
