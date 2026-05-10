"""
AI-Based Customer Support Classifier API.
Categories: complaint, inquiry, feedback.
"""

from __future__ import annotations

import csv
import json
import os
import threading
from collections import Counter
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import joblib
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(Path(__file__).resolve().parent / ".env")

from preprocess import clean_text, inquiry_cues  # noqa: E402

ALLOWED = frozenset({"complaint", "inquiry", "feedback"})
_pipeline = None
_log_lock = threading.Lock()


def _prediction_logging_enabled() -> bool:
    return os.environ.get("PREDICTION_LOGGING", "true").lower() in (
        "1",
        "true",
        "yes",
    )


def prediction_log_path() -> Path:
    raw = os.environ.get("PREDICTION_LOG_PATH")
    if raw:
        return Path(raw).expanduser().resolve()
    return REPO_ROOT / "backend" / "prediction_logs.csv"


def resolved_model_path() -> Path:
    raw = os.environ.get("MODEL_PATH")
    if raw:
        p = Path(raw).expanduser()
        if not p.is_absolute():
            p = (REPO_ROOT / p).resolve()
        else:
            p = p.resolve()
        return p
    primary = (
        REPO_ROOT
        / "models"
        / "sklearn_classifier"
        / "latest"
        / "classifier.joblib"
    )
    legacy = Path(__file__).resolve().parent / "classifier.joblib"
    if primary.is_file():
        return primary
    if legacy.is_file():
        return legacy
    return primary


def model_version_info(model_path: Path) -> dict:
    info: dict = {
        "model_path": str(model_path),
        "model_version": os.environ.get("MODEL_VERSION", "unknown"),
    }
    manifest = model_path.parent / "manifest.json"
    if manifest.is_file():
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
            rid = data.get("mlflow_run_id")
            if rid:
                info["model_version"] = str(rid)
            info["manifest"] = data
        except (json.JSONDecodeError, OSError):
            pass
    return info


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        path = resolved_model_path()
        if not path.is_file():
            raise FileNotFoundError(
                f"Missing model at {path}. Train with: python training/train.py "
                f"(or set MODEL_PATH)."
            )
        _pipeline = joblib.load(path)
    return _pipeline


def _append_prediction_log(
    raw_input: str,
    category: str,
    probabilities: dict[str, float] | None,
) -> None:
    if not _prediction_logging_enabled():
        return
    path = prediction_log_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    row = [
        datetime.now(timezone.utc).isoformat(),
        raw_input.replace("\n", " ").strip(),
        category,
        json.dumps(probabilities) if probabilities else "",
    ]
    with _log_lock:
        new_file = not path.is_file()
        with path.open("a", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            if new_file:
                w.writerow(["timestamp", "input", "category", "probabilities_json"])
            w.writerow(row)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        get_pipeline()
    except FileNotFoundError:
        pass
    yield


app = FastAPI(
    title="Customer Support Classifier",
    description="Classify support messages: complaint, inquiry, or feedback.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str


def _refine_inquiry_vs_feedback(
    category: str,
    probs: dict[str, float] | None,
    cleaned: str,
) -> tuple[str, dict[str, float] | None]:
    """
    If strong inquiry cues exist but the model narrowly picks feedback, prefer inquiry.
    """
    if not probs or not inquiry_cues(cleaned):
        return category, probs
    if category != "feedback":
        return category, probs
    pi = float(probs.get("inquiry", 0))
    pf = float(probs.get("feedback", 0))
    if pi < pf - 0.03:
        return category, probs
    new_probs = dict(probs)
    new_probs["inquiry"], new_probs["feedback"] = pf, pi
    s = sum(new_probs.values()) or 1.0
    new_probs = {k: round(v / s, 4) for k, v in new_probs.items()}
    return "inquiry", new_probs


@app.get("/api/health")
def health():
    path = resolved_model_path()
    ready = path.is_file()
    body = {
        "status": "ok",
        "model_ready": ready,
        **model_version_info(path),
    }
    return body


@app.get("/api/metrics/summary")
def metrics_summary():
    path = prediction_log_path()
    if not path.is_file():
        return {
            "prediction_rows": 0,
            "counts_by_category": {},
            "log_path": str(path),
            "note": "No predictions logged yet.",
        }
    counts: Counter[str] = Counter()
    rows = 0
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows += 1
            cat = (row.get("category") or "").strip().lower()
            if cat:
                counts[cat] += 1
    return {
        "prediction_rows": rows,
        "counts_by_category": dict(counts),
        "log_path": str(path),
    }


@app.post("/api/predict")
def predict(body: PredictRequest):
    raw = (body.text or "").strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        clf = get_pipeline()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    cleaned = clean_text(raw)
    if not cleaned:
        raise HTTPException(
            status_code=400,
            detail="No usable text after cleaning.",
        )

    category = str(clf.predict([cleaned])[0]).lower().strip()
    if category not in ALLOWED:
        raise HTTPException(status_code=500, detail="Unexpected model output.")

    proba = None
    if hasattr(clf, "predict_proba"):
        p = clf.predict_proba([cleaned])[0]
        labels = clf.classes_
        proba = {
            str(lab): round(float(pr), 4)
            for lab, pr in zip(labels, p)
        }

    category, proba = _refine_inquiry_vs_feedback(category, proba, cleaned)
    _append_prediction_log(raw, category, proba)

    return {
        "input": raw,
        "category": category,
        "probabilities": proba,
    }


@app.get("/")
def root():
    return {
        "service": "Customer Support Classifier",
        "docs": "/docs",
        "health": "/api/health",
        "predict": "POST /api/predict",
        "metrics": "/api/metrics/summary",
    }
