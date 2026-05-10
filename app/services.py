"""Inference and enrichment service functions."""

import json
from pathlib import Path

import joblib
from nltk.sentiment import SentimentIntensityAnalyzer

from src.config import LABEL_ENCODER_PATH, MODEL_PATH, MODEL_REGISTRY_PATH, VECTORIZER_PATH
from src.features.action_engine import resolve_recommended_action
from src.features.business_mapping import map_intent_to_business_category
from src.features.main_class_mapping import map_intent_to_main_class
from src.features.rules import predict_priority
from src.logging.prediction_logger import log_prediction
from src.nlp.multilingual import detect_and_translate
from src.nlp.preprocess import _bootstrap_nltk


class PredictionService:
    def __init__(self) -> None:
        _bootstrap_nltk()
        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.model_version = self._get_model_version()

    def _get_model_version(self) -> str:
        if Path(MODEL_REGISTRY_PATH).exists():
            try:
                payload = json.loads(Path(MODEL_REGISTRY_PATH).read_text(encoding="utf-8"))
                return payload.get("active_version", "model_v1.pkl")
            except Exception:
                return "model_v1.pkl"
        return "model_v1.pkl"

    def _sentiment_label(self, text: str) -> str:
        score = self.sentiment_analyzer.polarity_scores(text)["compound"]
        if score >= 0.05:
            return "Positive"
        if score <= -0.05:
            return "Negative"
        return "Neutral"

    def _is_feedback_like(self, text: str) -> bool:
        normalized = text.lower()
        feedback_terms = [
            "review",
            "feedback",
            "great",
            "good",
            "excellent",
            "awesome",
            "love",
            "like",
            "bad experience",
            "improve",
        ]
        return any(term in normalized for term in feedback_terms)

    def predict(self, text: str, transcript_text: str | None = None) -> dict:
        language_result = detect_and_translate(text)
        model_text = language_result.translated_text

        vec = self.vectorizer.transform([model_text])
        probabilities = self.model.predict_proba(vec)[0]
        class_idx = int(probabilities.argmax())
        intent = self.label_encoder.inverse_transform([class_idx])[0]
        confidence = float(probabilities[class_idx])
        sentiment = self._sentiment_label(model_text)
        main_class = map_intent_to_main_class(intent)
        if main_class != "Feedback" and self._is_feedback_like(model_text):
            main_class = "Feedback"

        business_category = map_intent_to_business_category(intent)
        priority = predict_priority(intent, model_text)
        action_result = resolve_recommended_action(
            text=model_text,
            intent=intent,
            business_category=business_category,
            main_class=main_class,
            priority=priority,
            sentiment=sentiment,
            confidence_score=confidence,
        )

        payload = {
            "detected_language": language_result.detected_language,
            "translated_text": language_result.translated_text,
            "transcript_text": transcript_text,
            "main_class": main_class,
            "intent": intent,
            "business_category": business_category,
            "sentiment": sentiment,
            "priority": priority,
            "confidence_score": round(confidence, 4),
            "recommended_action": action_result.recommended_action,
            "action_source": action_result.action_source,
        }
        log_prediction({"input_text": text, "model_version": self.model_version, **payload})
        return payload
