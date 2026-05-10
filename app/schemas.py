"""Pydantic schemas for API contracts."""

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=5000, description="Customer support message")


class PredictResponse(BaseModel):
    intent: str
    business_category: str
    sentiment: str
    priority: str
    confidence_score: float
    recommended_action: str
