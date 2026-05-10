"""Automated retraining entrypoint with model versioning."""

import json
from datetime import datetime, timezone
from pathlib import Path
import shutil

from src.config import MODEL_PATH, MODEL_REGISTRY_PATH, MODELS_DIR
from src.train import train


def _next_version(existing_versions: list[str]) -> str:
    if not existing_versions:
        return "model_v1.pkl"
    numeric = []
    for version in existing_versions:
        try:
            numeric.append(int(version.replace("model_v", "").replace(".pkl", "")))
        except Exception:
            continue
    return f"model_v{(max(numeric) + 1) if numeric else 1}.pkl"


def run_retraining() -> dict:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    registry = {"history": []}
    if Path(MODEL_REGISTRY_PATH).exists():
        try:
            registry = json.loads(Path(MODEL_REGISTRY_PATH).read_text(encoding="utf-8"))
        except Exception:
            registry = {"history": []}

    history = registry.get("history", [])
    new_version = _next_version([entry.get("version", "") for entry in history])
    result = train()

    versioned_path = MODELS_DIR / new_version
    shutil.copy2(MODEL_PATH, versioned_path)
    timestamp = datetime.now(timezone.utc).isoformat()

    history.append(
        {
            "version": new_version,
            "created_at": timestamp,
            "accuracy": result.metrics.get("accuracy"),
            "mlflow_run_id": result.run_id,
        }
    )
    registry_payload = {
        "active_version": new_version,
        "last_retrained_at": timestamp,
        "last_accuracy": result.metrics.get("accuracy"),
        "history": history,
    }
    Path(MODEL_REGISTRY_PATH).write_text(json.dumps(registry_payload, indent=2), encoding="utf-8")
    return registry_payload


if __name__ == "__main__":
    payload = run_retraining()
    print(json.dumps(payload, indent=2))
