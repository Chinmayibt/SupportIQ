"""Central project configuration and filesystem paths."""

import os
from pathlib import Path
from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")

DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
MODELS_DIR = PROJECT_ROOT / "models"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
LOGS_DIR = PROJECT_ROOT / "logs"
MLRUNS_DIR = PROJECT_ROOT / "mlruns"

DATASET_ZIP_NAME = "customer-support-intent-dataset.zip"
TRAIN_FILE = "Bitext_Sample_Customer_Service_Training_Dataset.csv"
VALID_FILE = "Bitext_Sample_Customer_Service_Validation_Dataset.csv"
TEST_FILE = "Bitext_Sample_Customer_Service_Testing_Dataset.csv"

MODEL_PATH = MODELS_DIR / "model.joblib"
VECTORIZER_PATH = MODELS_DIR / "vectorizer.joblib"
LABEL_ENCODER_PATH = MODELS_DIR / "label_encoder.joblib"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"
CONFUSION_MATRIX_PATH = ARTIFACTS_DIR / "confusion_matrix.png"
PREDICTIONS_LOG_PATH = LOGS_DIR / "predictions.csv"
MODEL_REGISTRY_PATH = MODELS_DIR / "model_registry.json"

# LLM + voice + realtime config
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "llama-3.1-8b-instant")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_WHISPER_MODEL = os.getenv("GROQ_WHISPER_MODEL", "whisper-large-v3")

COMPLAINT_SPIKE_THRESHOLD = int(os.getenv("COMPLAINT_SPIKE_THRESHOLD", "5"))
CRITICAL_INCIDENT_THRESHOLD = int(os.getenv("CRITICAL_INCIDENT_THRESHOLD", "3"))
ALERT_WINDOW_MINUTES = int(os.getenv("ALERT_WINDOW_MINUTES", "30"))


def ensure_directories() -> None:
    """Create the expected runtime directories if absent."""
    for path in [DATA_DIR, RAW_DATA_DIR, MODELS_DIR, ARTIFACTS_DIR, LOGS_DIR, MLRUNS_DIR]:
        path.mkdir(parents=True, exist_ok=True)
