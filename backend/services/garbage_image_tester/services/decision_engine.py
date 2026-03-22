"""
Decision Engine

Applies confidence thresholds to AI validation results and determines submission fate.
"""

from dataclasses import dataclass
from typing import Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from services.ai_validation_service import ValidationResult


# Decision action types
DecisionAction = Literal["ACCEPT", "PENDING_REVIEW", "REJECT"]


@dataclass
class Decision:
    """
    Decision result from the Decision Engine.
    
    Attributes:
        action: The decision action (ACCEPT, PENDING_REVIEW, or REJECT)
        status_code: HTTP status code for the response
        response_data: Dictionary containing response data for the client
    """
    action: DecisionAction
    status_code: int
    response_data: dict


class DecisionEngine:
    """
    Decision Engine that applies confidence thresholds to validation results.
    
    Thresholds:
        - confidence >= 0.75 with "valid" label → ACCEPT
        - confidence 0.50-0.75 with "valid" label → PENDING_REVIEW
        - confidence < 0.50 or "invalid" label → REJECT
    """
    
    # Confidence thresholds
    ACCEPT_THRESHOLD = 0.75
    REJECT_THRESHOLD = 0.50
    
    def make_decision(self, validation_result: "ValidationResult") -> Decision:
        """
        Applies confidence thresholds to determine submission fate.
        
        Args:
            validation_result: ValidationResult from AI validation service
            
        Returns:
            Decision object with action, status_code, and response_data
        """
        label = validation_result.label
        confidence = validation_result.confidence
        reason = validation_result.reason
        
        # Apply threshold logic
        if label == "valid" and confidence >= self.ACCEPT_THRESHOLD:
            # High confidence valid submission → ACCEPT
            return Decision(
                action="ACCEPT",
                status_code=200,
                response_data={
                    "status": "accepted",
                    "label": label,
                    "confidence": confidence,
                    "reason": reason
                }
            )
        
        elif label == "valid" and self.REJECT_THRESHOLD <= confidence < self.ACCEPT_THRESHOLD:
            # Ambiguous valid submission → PENDING_REVIEW
            return Decision(
                action="PENDING_REVIEW",
                status_code=200,
                response_data={
                    "status": "pending_review",
                    "message": "Your submission is under review",
                    "label": label,
                    "confidence": confidence
                }
            )
        
        else:
            # Invalid label or low confidence → REJECT
            return Decision(
                action="REJECT",
                status_code=200,
                response_data={
                    "status": "rejected",
                    "message": "Only images of untidy or garbage areas are accepted. Please try again.",
                    "label": label,
                    "confidence": confidence,
                    "reason": reason
                }
            )
