"""MLflow tracking wrapper."""

from pathlib import Path
from typing import Dict

import mlflow

from src.config import MLRUNS_DIR


def configure_mlflow(experiment_name: str = "ticket_intent_classifier") -> None:
    mlflow.set_tracking_uri(f"file://{MLRUNS_DIR.resolve()}")
    mlflow.set_experiment(experiment_name)


def log_training_run(params: Dict[str, str], metrics: Dict[str, float], artifacts_dir: Path, model_dir: Path) -> str:
    with mlflow.start_run() as run:
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)
        if artifacts_dir.exists():
            mlflow.log_artifacts(str(artifacts_dir), artifact_path="artifacts")
        if model_dir.exists():
            mlflow.log_artifacts(str(model_dir), artifact_path="models")
        return run.info.run_id
