from __future__ import annotations

import importlib
import sys
from pathlib import Path

import joblib
import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


@pytest.fixture
def minimal_classifier_path(tmp_path: Path) -> Path:
    X = [
        "refund broken terrible",
        "what size color available stock",
        "great love thanks amazing",
    ]
    y = ["complaint", "inquiry", "feedback"]
    pipe = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", LogisticRegression(max_iter=300, class_weight="balanced")),
        ]
    )
    pipe.fit(X, y)
    path = tmp_path / "classifier.joblib"
    joblib.dump(pipe, path)
    return path


@pytest.fixture
def live_app(
    monkeypatch: pytest.MonkeyPatch,
    minimal_classifier_path: Path,
    tmp_path: Path,
):
    log = tmp_path / "predictions.csv"
    monkeypatch.setenv("MODEL_PATH", str(minimal_classifier_path))
    monkeypatch.setenv("PREDICTION_LOG_PATH", str(log))
    monkeypatch.setenv("PREDICTION_LOGGING", "true")

    import app as app_mod

    importlib.reload(app_mod)
    from fastapi.testclient import TestClient

    return TestClient(app_mod.app), app_mod, log
