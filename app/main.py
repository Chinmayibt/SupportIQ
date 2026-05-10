"""FastAPI entrypoint for ticket classification inference."""

import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.analytics import get_prediction_analytics, get_recent_logs, get_realtime_alerts
from app.schemas import PredictRequest, PredictResponse
from app.services import PredictionService
from src.audio.transcription import transcribe_audio_file
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


@app.get("/alerts")
def alerts() -> dict:
    try:
        return get_realtime_alerts()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Alerts failed: {exc}") from exc


@app.get("/logs/recent")
def recent_logs(limit: int = 30) -> list[dict]:
    try:
        return get_recent_logs(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recent logs failed: {exc}") from exc


@app.get("/model/status")
def model_status() -> dict:
    analytics_payload = get_prediction_analytics()
    return {
        "status": "ready" if service is not None else "unavailable",
        "active_version": analytics_payload.get("active_model_version", "model_v1.pkl"),
        "last_retrained_at": analytics_payload.get("last_retrained_at"),
        "model_accuracy": analytics_payload.get("model_accuracy"),
        "total_predictions": analytics_payload.get("total_predictions", 0),
    }


@app.get("/dashboard")
def dashboard(limit: int = 15) -> dict:
    """Single payload endpoint to avoid repetitive frontend multi-calls."""
    analytics_payload = get_prediction_analytics()
    return {
        "analytics": analytics_payload,
        "alerts": get_realtime_alerts(),
        "recent_logs": get_recent_logs(limit=limit),
        "model_status": {
            "status": "ready" if service is not None else "unavailable",
            "active_version": analytics_payload.get("active_model_version", "model_v1.pkl"),
            "last_retrained_at": analytics_payload.get("last_retrained_at"),
            "model_accuracy": analytics_payload.get("model_accuracy"),
            "total_predictions": analytics_payload.get("total_predictions", 0),
        },
    }


@app.post("/predict/audio", response_model=PredictResponse)
def predict_audio(file: UploadFile = File(...)) -> PredictResponse:
    global service
    if service is None:
        try:
            service = PredictionService()
        except Exception as exc:
            raise HTTPException(status_code=503, detail=f"Model service unavailable: {exc}") from exc

    suffix = Path(file.filename or "").suffix.lower()

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file.file.read())
            tmp_path = Path(tmp.name)
        transcript = transcribe_audio_file(tmp_path) or ""
        if not transcript.strip():
            raise HTTPException(status_code=422, detail="Unable to transcribe audio file.")
        return PredictResponse(**service.predict(transcript, transcript_text=transcript))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Audio prediction failed: {exc}") from exc
    finally:
        try:
            if "tmp_path" in locals() and tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass
