"""Training pipeline for intent classification."""

from dataclasses import dataclass
from typing import List, Tuple

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

from src.config import (
    CONFUSION_MATRIX_PATH,
    LABEL_ENCODER_PATH,
    METRICS_PATH,
    MODEL_PATH,
    VECTORIZER_PATH,
    ensure_directories,
)
from src.data.ingest import load_splits, materialize_raw_csvs
from src.evaluate import compute_metrics, save_confusion_matrix, save_metrics
from src.nlp.preprocess import preprocess_text
from src.tracking.mlflow_tracker import configure_mlflow, log_training_run


@dataclass
class TrainingArtifacts:
    metrics: dict
    run_id: str


def _to_dataframe(rows: List[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows)[["utterance", "intent"]].dropna()


def _prepare_xy(df: pd.DataFrame) -> Tuple[List[str], List[str]]:
    x = df["utterance"].astype(str).tolist()
    y = df["intent"].astype(str).tolist()
    return x, y


def train() -> TrainingArtifacts:
    ensure_directories()
    materialize_raw_csvs()
    splits = load_splits()

    train_df = _to_dataframe(splits["train"])
    val_df = _to_dataframe(splits["validation"])
    test_df = _to_dataframe(splits["test"])

    combined_train_df = pd.concat([train_df, val_df], ignore_index=True)
    x_train, y_train = _prepare_xy(combined_train_df)
    x_test, y_test = _prepare_xy(test_df)

    label_encoder = LabelEncoder()
    y_train_encoded = label_encoder.fit_transform(y_train)

    vectorizer = TfidfVectorizer(preprocessor=preprocess_text, max_features=8000, ngram_range=(1, 2))
    x_train_vec = vectorizer.fit_transform(x_train)
    x_test_vec = vectorizer.transform(x_test)

    model = LogisticRegression(max_iter=1200)
    model.fit(x_train_vec, y_train_encoded)

    pred_encoded = model.predict(x_test_vec)
    y_pred = label_encoder.inverse_transform(pred_encoded)

    metrics = compute_metrics(y_test, y_pred.tolist())
    save_metrics(metrics, METRICS_PATH)
    save_confusion_matrix(y_test, y_pred.tolist(), label_encoder.classes_.tolist(), CONFUSION_MATRIX_PATH)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)

    configure_mlflow()
    params = {
        "model_type": "LogisticRegression",
        "vectorizer": "TfidfVectorizer",
        "max_features": "8000",
        "ngram_range": "(1,2)",
    }
    run_id = log_training_run(params, metrics, CONFUSION_MATRIX_PATH.parent, MODEL_PATH.parent)
    return TrainingArtifacts(metrics=metrics, run_id=run_id)


if __name__ == "__main__":
    result = train()
    print("Training complete.")
    print(result.metrics)
    print(f"MLflow run_id: {result.run_id}")
