"""
AI Validation Service

Integrates with Gemini 2.0 Flash via LangChain to validate garbage images.
"""

import os
import base64
import json
import logging
from typing import Optional
from dataclasses import dataclass
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """
    Structured result from AI validation.
    
    Attributes:
        label: "valid" or "invalid"
        confidence: Float between 0.00 and 1.00
        reason: Brief explanation of the classification
        raw_response: Original JSON response from model
    """
    label: str
    confidence: float
    reason: str
    raw_response: str


class AIValidationService:
    """
    AI-powered image validation service using Gemini 2.0 Flash via LangChain.
    
    Validates whether submitted images depict legitimate public garbage/littering issues.
    """
    
    # System prompt with validation criteria and few-shot examples
    SYSTEM_PROMPT = """You are an image classifier for a civic garbage reporting system. Analyze the provided image and determine if it shows a legitimate PUBLIC garbage or untidy area problem.

VALID images show OUTDOOR/PUBLIC garbage issues ONLY:
- Garbage piles on streets or sidewalks
- Overflowing public bins
- Littered parks or public spaces
- Outdoor dumping sites
- Community untidy areas (outdoor)
- Trash on public roads or pathways

INVALID images show:
- Indoor trash or rooms (even with garbage)
- Indoor trash cans or bins
- Messy rooms or indoor spaces
- Photos of only people
- Animals only
- Clean areas with no visible garbage
- Scenic shots without any trash
- Single small items (one cigarette butt)
- Unrelated content

Examples:
Valid: Outdoor garbage pile on sidewalk
Valid: Overflowing public trash bin on street
Valid: Park area with scattered litter
Valid: Outdoor dumping site
Invalid: Indoor trash can with garbage
Invalid: Messy room with trash on floor
Invalid: Indoor kitchen with garbage
Invalid: Clean park with no visible garbage
Invalid: Photo of just a person or animal

CRITICAL RULES:
1. If the image shows an INDOOR scene, classify as INVALID (even if garbage is visible)
2. Only OUTDOOR/PUBLIC garbage problems should be classified as VALID
3. Be conservative - when in doubt, mark as INVALID

Return JSON only in this exact format:
{
  "label": "valid" or "invalid",
  "confidence": 0.00-1.00,
  "reason": "brief explanation"
}"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI Validation Service with LangChain integration.
        
        Args:
            api_key: Google API key for Gemini. If None, reads from GOOGLE_API_KEY env var.
        """
        if api_key is None:
            api_key = os.getenv("GOOGLE_API_KEY")
            
        if not api_key:
            raise ValueError("GOOGLE_API_KEY must be provided or set in environment")
        
        # Initialize ChatGoogleGenerativeAI with Gemini 2.5 Flash
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.1  # Low temperature for consistent classification
        )
    
    def validate_image(self, image_bytes: bytes, address: str) -> ValidationResult:
        """
        Validates an image using AI model.
        
        Args:
            image_bytes: Raw bytes of the image to validate
            address: Address text associated with the submission
            
        Returns:
            ValidationResult with label, confidence, reason, and raw response
            
        Raises:
            ValueError: If image_bytes is empty or invalid
            Exception: If AI model invocation fails
        """
        if not image_bytes:
            raise ValueError("image_bytes cannot be empty")
        
        # Encode image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Construct multimodal messages
        messages = [
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=[
                {"type": "text", "text": f"Address: {address}"},
                {
                    "type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{base64_image}"
                }
            ])
        ]
        
        # Invoke model
        try:
            response = self.model.invoke(messages)
            response_text = response.content
            
            # Log the raw response for debugging
            logger.info(f"AI model raw response: {response_text[:500]}")
            
            # Parse and validate JSON response
            return self._parse_response(response_text)
            
        except Exception as e:
            logger.error(f"AI model error: {str(e)}")
            raise Exception(f"AI model invocation failed: {str(e)}") from e
    
    CLEANUP_SYSTEM_PROMPT = """You are an image classifier for a civic cleanup verification system. Analyze the provided image and determine if it shows an area that has been cleaned up (no visible garbage or litter).

VALID (clean) images show:
- Clear outdoor areas with no visible garbage
- Streets or sidewalks free of litter
- Parks or public spaces that look tidy
- Areas that appear recently cleaned

INVALID (not clean) images show:
- Visible garbage, litter, or waste still present
- Overflowing bins or dumping sites
- Partially cleaned areas with remaining trash

Return JSON only in this exact format:
{
  "label": "valid" or "invalid",
  "confidence": 0.00-1.00,
  "reason": "brief explanation"
}"""

    def validate_cleanup_image(self, image_bytes: bytes) -> ValidationResult:
        """
        Validates a cleanup proof image — checks if the area looks clean.

        Args:
            image_bytes: Raw bytes of the cleanup image

        Returns:
            ValidationResult with label="valid" meaning the area is clean
        """
        if not image_bytes:
            raise ValueError("image_bytes cannot be empty")

        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        messages = [
            SystemMessage(content=self.CLEANUP_SYSTEM_PROMPT),
            HumanMessage(content=[
                {"type": "text", "text": "Does this image show a clean area free of garbage?"},
                {
                    "type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{base64_image}"
                }
            ])
        ]

        try:
            response = self.model.invoke(messages)
            return self._parse_response(response.content)
        except Exception as e:
            logger.error(f"AI cleanup model error: {str(e)}")
            raise Exception(f"AI model invocation failed: {str(e)}") from e

    def _parse_response(self, response_text: str) -> ValidationResult:
        """
        Parses and validates AI model response.
        
        Args:
            response_text: Raw text response from model
            
        Returns:
            ValidationResult object
            
        Raises:
            ValueError: If response is malformed or invalid
        """
        try:
            # Clean response text - remove markdown code blocks if present
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            # Check if response is empty
            if not cleaned_text:
                raise ValueError("Empty response from AI model")
            
            # Parse JSON
            parsed = json.loads(cleaned_text)
            
            # Extract required fields
            label = parsed.get("label")
            confidence = parsed.get("confidence")
            reason = parsed.get("reason", "")
            
            # Validate label
            if label not in ["valid", "invalid"]:
                raise ValueError(f"Invalid label: {label}. Must be 'valid' or 'invalid'")
            
            # Validate confidence
            if not isinstance(confidence, (int, float)):
                raise ValueError(f"Confidence must be numeric, got: {type(confidence)}")
            
            confidence = float(confidence)
            if not (0.0 <= confidence <= 1.0):
                raise ValueError(f"Confidence must be between 0.00 and 1.00, got: {confidence}")
            
            # Return structured result
            return ValidationResult(
                label=label,
                confidence=confidence,
                reason=reason,
                raw_response=response_text
            )
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {str(e)}. Raw response: {response_text[:200]}") from e
        except KeyError as e:
            raise ValueError(f"Missing required field in response: {str(e)}") from e
