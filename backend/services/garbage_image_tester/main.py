"""
Garbage Validation System - Main Application Entry Point

This application validates citizen-submitted photos of untidy areas using
AI-powered image classification with Gemini 2.0 Flash via LangChain.
"""

import os
import hashlib
import logging
import traceback
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import init_db
from services.image_validator import ImageValidator
from services.ai_validation_service import AIValidationService
from services.decision_engine import DecisionEngine
from services.storage_manager import StorageManager
from services.manual_review_queue import ManualReviewQueue
from services.audit_logger import AuditLogger

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="Garbage Validation System",
    description="AI-powered civic reporting system for validating garbage and untidy area submissions",
    version="1.0.0"
)

# Initialize services
image_validator = ImageValidator()
decision_engine = DecisionEngine()
storage_manager = StorageManager()
manual_review_queue = ManualReviewQueue()
audit_logger = AuditLogger()

# Initialize AI service (will be created per request to handle errors gracefully)
def get_ai_service():
    """Get AI validation service instance"""
    try:
        return AIValidationService()
    except Exception as e:
        logger.error(f"Failed to initialize AI service: {str(e)}")
        raise

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Garbage Validation System",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    api_key_configured = bool(os.getenv("GOOGLE_API_KEY"))
    
    return {
        "status": "healthy",
        "api_key_configured": api_key_configured,
        "database_url": os.getenv("DATABASE_URL", "Not configured"),
        "blob_storage_path": os.getenv("BLOB_STORAGE_PATH", "Not configured")
    }

@app.post("/api/submissions")
async def create_submission(
    address: str = Form(..., description="Address of the untidy area"),
    photo: UploadFile = File(..., description="Photo of the untidy area")
):
    """
    Submit a photo and address of an untidy area for validation.
    
    This endpoint:
    1. Validates the uploaded file (type and size)
    2. Uses AI to validate the image content
    3. Makes a decision based on confidence thresholds
    4. Stores accepted submissions or queues ambiguous ones for review
    5. Logs all decisions to the audit log
    
    Args:
        address: Text description of the location
        photo: Image file (JPEG, PNG, GIF, WebP, max 10MB)
    
    Returns:
        JSON response with status, submission_id (if accepted), and validation details
    """
    image_bytes = None
    image_hash = None
    
    try:
        # Read image bytes from uploaded file
        image_bytes = await photo.read()
        
        # Compute image hash for audit logging
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        
        # Step 1: Validate file type and size
        is_valid, error_message, validated_bytes = image_validator.validate_file(
            image_bytes, 
            photo.filename
        )
        
        if not is_valid:
            # Log validation failure
            logger.warning(f"File validation failed for {address}: {error_message}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": error_message,
                    "address": address
                }
            )
        
        # Step 2: Call AI Validation Service
        try:
            ai_service = get_ai_service()
            validation_result = ai_service.validate_image(validated_bytes, address)
            
            logger.info(
                f"AI validation complete - Label: {validation_result.label}, "
                f"Confidence: {validation_result.confidence}, Address: {address}"
            )
            
        except ValueError as e:
            # JSON parsing or validation error - treat as unclear image
            logger.error(f"AI response parsing failed: {str(e)}\n{traceback.format_exc()}")
            
            # Log to audit with error details
            if image_hash:
                try:
                    audit_logger.log_decision(
                        address=address,
                        image_hash=image_hash,
                        ai_label="error",
                        ai_confidence=0.0,
                        ai_reason=f"Parsing error: {str(e)}",
                        decision="rejected",
                        model_response_raw={"error": str(e)}
                    )
                except Exception as audit_error:
                    logger.error(f"Failed to log audit: {str(audit_error)}")
            
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Image unclear. Please upload a clear photo of an untidy/garbage area.",
                    "address": address
                }
            )
            
        except Exception as e:
            # AI model API failure
            logger.error(f"AI model error: {str(e)}\n{traceback.format_exc()}")
            
            # Log to audit with error details
            if image_hash:
                try:
                    audit_logger.log_decision(
                        address=address,
                        image_hash=image_hash,
                        ai_label="error",
                        ai_confidence=0.0,
                        ai_reason=f"Model error: {str(e)}",
                        decision="error",
                        model_response_raw={"error": str(e)}
                    )
                except Exception as audit_error:
                    logger.error(f"Failed to log audit: {str(audit_error)}")
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Model error",
                    "details": str(e),
                    "address": address
                }
            )
        
        # Step 3: Make decision based on validation result
        decision = decision_engine.make_decision(validation_result)
        
        # Step 4: Handle decision actions
        try:
            if decision.action == "ACCEPT":
                # Store submission permanently
                submission_id = storage_manager.store_submission(
                    image_bytes=validated_bytes,
                    address=address,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason
                )
                
                logger.info(f"Submission accepted: {submission_id}")
                
                # Log to audit
                audit_logger.log_decision(
                    address=address,
                    image_hash=image_hash,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason,
                    decision="accepted",
                    model_response_raw={"raw_response": validation_result.raw_response}
                )
                
                # Add submission_id to response
                response_data = decision.response_data.copy()
                response_data["submission_id"] = submission_id
                
                return JSONResponse(
                    status_code=decision.status_code,
                    content=response_data
                )
                
            elif decision.action == "PENDING_REVIEW":
                # Add to manual review queue
                review_id = manual_review_queue.add_to_queue(
                    image_bytes=validated_bytes,
                    address=address,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason
                )
                
                logger.info(f"Submission queued for review: {review_id}")
                
                # Log to audit
                audit_logger.log_decision(
                    address=address,
                    image_hash=image_hash,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason,
                    decision="pending_review",
                    model_response_raw={"raw_response": validation_result.raw_response}
                )
                
                return JSONResponse(
                    status_code=decision.status_code,
                    content=decision.response_data
                )
                
            else:  # REJECT
                # Log rejection to audit
                audit_logger.log_decision(
                    address=address,
                    image_hash=image_hash,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason,
                    decision="rejected",
                    model_response_raw={"raw_response": validation_result.raw_response}
                )
                
                logger.info(f"Submission rejected - Address: {address}")
                
                return JSONResponse(
                    status_code=decision.status_code,
                    content=decision.response_data
                )
                
        except Exception as e:
            # Storage or queue failure
            logger.error(f"Storage/queue error: {str(e)}\n{traceback.format_exc()}")
            
            # Try to log to audit
            try:
                audit_logger.log_decision(
                    address=address,
                    image_hash=image_hash,
                    ai_label=validation_result.label,
                    ai_confidence=validation_result.confidence,
                    ai_reason=validation_result.reason,
                    decision="error",
                    model_response_raw={"error": str(e)}
                )
            except Exception as audit_error:
                logger.error(f"Failed to log audit: {str(audit_error)}")
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Storage error",
                    "details": str(e),
                    "address": address
                }
            )
    
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "details": str(e)
            }
        )

@app.post("/api/validate/dump")
async def validate_dump(request: dict):
    """
    Validate a garbage dump image from a URL (used by GreenLoop Node.js backend).
    
    Accepts: { "imageUrl": "https://..." }
    Returns: { "isValid": bool, "reasoning": str, "confidence": float }
    """
    import httpx

    image_url = request.get("imageUrl")
    if not image_url:
        return JSONResponse(status_code=400, content={"error": "imageUrl is required"})

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            image_bytes = resp.content
    except Exception as e:
        logger.error(f"Failed to fetch image from URL: {str(e)}")
        return JSONResponse(status_code=400, content={"error": f"Failed to fetch image: {str(e)}"})

    try:
        ai_service = get_ai_service()
        result = ai_service.validate_image(image_bytes, image_url)
    except Exception as e:
        logger.error(f"AI validation error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"isValid": False, "reasoning": f"AI validation failed: {str(e)}", "confidence": 0}
        )

    return {
        "isValid": result.label == "valid" and result.confidence >= decision_engine.ACCEPT_THRESHOLD,
        "reasoning": result.reason,
        "confidence": result.confidence
    }


@app.post("/api/validate/cleanup")
async def validate_cleanup(request: dict):
    """
    Validate a cleanup proof image from a URL (used by GreenLoop Node.js backend).

    Accepts: { "imageUrl": "https://..." }
    Returns: { "isClean": bool, "reasoning": str, "confidence": float }
    """
    import httpx

    image_url = request.get("imageUrl")
    if not image_url:
        return JSONResponse(status_code=400, content={"error": "imageUrl is required"})

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            image_bytes = resp.content
    except Exception as e:
        logger.error(f"Failed to fetch image from URL: {str(e)}")
        return JSONResponse(status_code=400, content={"error": f"Failed to fetch image: {str(e)}"})

    try:
        ai_service = get_ai_service()
        result = ai_service.validate_cleanup_image(image_bytes)
    except Exception as e:
        logger.error(f"AI cleanup validation error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"isClean": False, "reasoning": f"AI validation failed: {str(e)}", "confidence": 0}
        )

    return {
        "isClean": result.label == "valid" and result.confidence >= decision_engine.ACCEPT_THRESHOLD,
        "reasoning": result.reason,
        "confidence": result.confidence
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
