"""
Train TF-IDF + LogisticRegression on TWCS inbound messages with weak labels.
Logs metrics and artifacts to MLflow; writes versioned + latest classifier.joblib.

Run from repo root:
  python training/train.py
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

import joblib
import mlflow
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from preprocess import clean_text, weak_label  # noqa: E402

import config  # noqa: E402


def build_pipeline() -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=config.TFIDF_MAX_FEATURES,
                    ngram_range=config.TFIDF_NGRAM_RANGE,
                    min_df=config.TFIDF_MIN_DF,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=config.LOGISTIC_MAX_ITER,
                    class_weight="balanced",
                ),
            ),
        ]
    )


def main() -> None:
    if not config.DATA_RAW_CSV.is_file():
        raise SystemExit(f"Dataset not found: {config.DATA_RAW_CSV}")

    os.environ.setdefault("MLFLOW_ENABLE_SYSTEM_METRICS_LOGGING", "false")
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    mlflow.set_experiment(config.EXPERIMENT_NAME)

    print("Loading CSV…")
    df = pd.read_csv(config.DATA_RAW_CSV, usecols=["inbound", "text"])
    df = df[df["inbound"] == True]  # noqa: E712
    df = df.dropna(subset=["text"])
    df["text"] = df["text"].astype(str)

    if len(df) > config.SAMPLE_SIZE:
        df = df.sample(n=config.SAMPLE_SIZE, random_state=config.RANDOM_STATE)

    print("Cleaning and labeling…")
    df["clean"] = df["text"].map(clean_text)
    df = df[df["clean"].str.len() > 0]
    df["label"] = df["clean"].map(weak_label)

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean"],
        df["label"],
        test_size=config.TEST_SIZE,
        random_state=config.RANDOM_STATE,
        stratify=df["label"],
    )

    pipeline = build_pipeline()

    params = {
        "sample_size": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "sample_size_cap": config.SAMPLE_SIZE,
        "random_state": config.RANDOM_STATE,
        "tfidf_max_features": config.TFIDF_MAX_FEATURES,
        "model_family": config.MODEL_FAMILY,
    }

    with mlflow.start_run() as run:
        mlflow.log_params(params)

        print("Training…")
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        f1_macro = float(f1_score(y_test, y_pred, average="macro"))
        f1_weighted = float(f1_score(y_test, y_pred, average="weighted"))

        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_macro", f1_macro)
        mlflow.log_metric("f1_weighted", f1_weighted)

        run_dir = config.ARTIFACT_ROOT / run.info.run_id
        run_dir.mkdir(parents=True, exist_ok=True)
        artifact_path = run_dir / "classifier.joblib"
        joblib.dump(pipeline, artifact_path)
        mlflow.log_artifact(str(artifact_path))

        # Promote to "latest" for API default
        latest_dir = config.ARTIFACT_ROOT / "latest"
        latest_dir.mkdir(parents=True, exist_ok=True)
        dest = latest_dir / "classifier.joblib"
        shutil.copy2(artifact_path, dest)

        meta = {
            "mlflow_run_id": run.info.run_id,
            "artifact_path": str(artifact_path.relative_to(ROOT)),
            "latest_path": str(dest.relative_to(ROOT)),
            "metrics": {"accuracy": acc, "f1_macro": f1_macro, "f1_weighted": f1_weighted},
        }
        (latest_dir / "manifest.json").write_text(
            json.dumps(meta, indent=2),
            encoding="utf-8",
        )

        print(f"Run ID: {run.info.run_id}")
        print(f"Accuracy: {acc:.4f}  F1 macro: {f1_macro:.4f}")
        print(f"Saved: {artifact_path}")
        print(f"Promoted to: {dest}")


if __name__ == "__main__":
    main()
