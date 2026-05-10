"""Inference and enrichment service functions."""

import joblib
from nltk.sentiment import SentimentIntensityAnalyzer

from src.config import LABEL_ENCODER_PATH, MODEL_PATH, VECTORIZER_PATH
from src.features.business_mapping import map_intent_to_business_category
from src.features.rules import DEFAULT_RECOMMENDED_ACTION, predict_priority, recommend_action
from src.llm.recommender import generate_llm_recommendation, llm_is_enabled
from src.logging.prediction_logger import log_prediction
from src.nlp.preprocess import _bootstrap_nltk


class PredictionService:
    def __init__(self) -> None:
        _bootstrap_nltk()
        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def _sentiment_label(self, text: str) -> str:
        score = self.sentiment_analyzer.polarity_scores(text)["compound"]
        if score >= 0.05:
            return "Positive"
        if score <= -0.05:
            return "Negative"
        return "Neutral"

    def predict(self, text: str) -> dict:
        vec = self.vectorizer.transform([text])
        probabilities = self.model.predict_proba(vec)[0]
        class_idx = int(probabilities.argmax())
        intent = self.label_encoder.inverse_transform([class_idx])[0]
        confidence = float(probabilities[class_idx])

        business_category = map_intent_to_business_category(intent)
        sentiment = self._sentiment_label(text)
        priority = predict_priority(intent, text)
        action = recommend_action(intent)

        # Use LLM for richer action guidance when rules fallback or confidence is low.
        if llm_is_enabled() and (action == DEFAULT_RECOMMENDED_ACTION or confidence < 0.65):
            llm_action = generate_llm_recommendation(
                text=text,
                intent=intent,
                business_category=business_category,
                priority=priority,
                sentiment=sentiment,
            )
            if llm_action:
                action = llm_action

        payload = {
            "intent": intent,
            "business_category": business_category,
            "sentiment": sentiment,
            "priority": priority,
            "confidence_score": round(confidence, 4),
            "recommended_action": action,
        }
        log_prediction({"input_text": text, **payload})
        return payload
