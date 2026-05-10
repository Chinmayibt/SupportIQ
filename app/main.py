"""FastAPI entrypoint for ticket classification inference."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.analytics import get_prediction_analytics
from app.schemas import PredictRequest, PredictResponse
from app.services import PredictionService
from src.config import ensure_directories

app = FastAPI(title="AI-Powered Customer Support Ticket Classifier", version="1.0.0")
service: PredictionService | None = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    global service
    ensure_directories()
    try:
        service = PredictionService()
    except Exception:
        # Service remains unavailable until training artifacts exist.
        service = None


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    global service
    if service is None:
        try:
            service = PredictionService()
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Model service unavailable: {exc}") from exc
    try:
        result = service.predict(request.text)
        return PredictResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.get("/analytics")
def analytics() -> dict:
    """Expose aggregate ticket analytics for frontend charts."""
    try:
        return get_prediction_analytics()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {exc}") from exc
