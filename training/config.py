"""Training and MLflow configuration (paths relative to repo root)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DATA_RAW_CSV = ROOT / "data" / "raw" / "twcs.csv"
DATA_PROCESSED_DIR = ROOT / "data" / "processed"

SAMPLE_SIZE = 40_000
RANDOM_STATE = 42
TEST_SIZE = 0.2

MLFLOW_TRACKING_URI = f"file:{ROOT / 'mlruns'}"
EXPERIMENT_NAME = "customer_support_sklearn"

MODEL_FAMILY = "sklearn_classifier"
ARTIFACT_ROOT = ROOT / "models" / MODEL_FAMILY
# Production promotion target (API default)
LATEST_MODEL_PATH = ARTIFACT_ROOT / "latest" / "classifier.joblib"

TFIDF_MAX_FEATURES = 60_000
TFIDF_NGRAM_RANGE = (1, 2)
TFIDF_MIN_DF = 2
LOGISTIC_MAX_ITER = 400
