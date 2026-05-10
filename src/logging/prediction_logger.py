"""Prediction logging utilities."""

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

from src.config import PREDICTIONS_LOG_PATH


FIELDS = [
    "timestamp",
    "input_text",
    "detected_language",
    "translated_text",
    "transcript_text",
    "main_class",
    "intent",
    "business_category",
    "sentiment",
    "priority",
    "confidence_score",
    "recommended_action",
    "action_source",
    "model_version",
]


def log_prediction(record: Dict[str, str]) -> None:
    path: Path = PREDICTIONS_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    _ensure_current_schema(path)
    exists = path.exists()

    row = {"timestamp": datetime.now(timezone.utc).isoformat(), **record}
    with path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow(row)


def _ensure_current_schema(path: Path) -> None:
    if not path.exists():
        return
    try:
        with path.open("r", encoding="utf-8", newline="") as f:
            header_line = f.readline().strip()
    except Exception:
        header_line = ""

    expected_header = ",".join(FIELDS)
    if header_line == expected_header:
        return

    # Mixed legacy schema corrupts analytics; rotate old file and start clean.
    backup_name = f"{path.stem}.legacy-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{path.suffix}"
    backup_path = path.with_name(backup_name)
    path.rename(backup_path)
