from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

REPO_ROOT = Path(__file__).resolve().parents[1]
FIXTURE = REPO_ROOT / "tests" / "fixtures" / "tiny_labeled.csv"


def test_evaluate_runs_on_fixture(tmp_path: Path):
    X = ["complaint text refund", "what size inquiry", "great feedback"]
    y = ["complaint", "inquiry", "feedback"]
    pipe = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", LogisticRegression(max_iter=200, class_weight="balanced")),
        ]
    )
    pipe.fit(X, y)
    model = tmp_path / "c.joblib"
    joblib.dump(pipe, model)

    proc = subprocess.run(
        [
            sys.executable,
            str(REPO_ROOT / "training" / "evaluate.py"),
            "--model",
            str(model),
            "--fixture",
            str(FIXTURE),
        ],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    assert "precision" in proc.stdout.lower() or "avg" in proc.stdout.lower()
