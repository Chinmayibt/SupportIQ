"""Prediction logging utilities."""

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

from src.config import PREDICTIONS_LOG_PATH


FIELDS = [
    "timestamp",
    "input_text",
    "intent",
    "business_category",
    "sentiment",
    "priority",
    "confidence_score",
    "recommended_action",
]


def log_prediction(record: Dict[str, str]) -> None:
    path: Path = PREDICTIONS_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    exists = path.exists()

    row = {"timestamp": datetime.now(timezone.utc).isoformat(), **record}
    with path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow(row)
