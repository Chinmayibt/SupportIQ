"""Pydantic schemas for API contracts."""

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=5000, description="Customer support message")


class IntentProbability(BaseModel):
    intent: str
    probability: float


class MainClassProbability(BaseModel):
    main_class: str
    probability: float


class PredictResponse(BaseModel):
    detected_language: str
    translated_text: str
    transcript_text: str | None = None
    main_class: str
    intent: str
    business_category: str
    sentiment: str
    priority: str
    confidence_score: float
    main_class_probabilities: list[MainClassProbability]
    intent_probabilities: list[IntentProbability]
    recommended_action: str
    action_source: str
