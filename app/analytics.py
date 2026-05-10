"""Analytics helpers for frontend dashboard consumption."""

from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

from src.config import PREDICTIONS_LOG_PATH


def _value_counts(df: pd.DataFrame, column: str) -> List[Dict[str, Any]]:
    counts = df[column].value_counts(dropna=False).reset_index()
    counts.columns = [column, "count"]
    return counts.to_dict(orient="records")


def get_prediction_analytics() -> Dict[str, Any]:
    """Build aggregate analytics payload from prediction logs."""
    log_path = Path(PREDICTIONS_LOG_PATH)
    if not log_path.exists():
        return {
            "total_predictions": 0,
            "most_common_issues": [],
            "sentiment_distribution": [],
            "category_distribution": [],
            "priority_distribution": [],
        }

    df = pd.read_csv(log_path)
    if df.empty:
        return {
            "total_predictions": 0,
            "most_common_issues": [],
            "sentiment_distribution": [],
            "category_distribution": [],
            "priority_distribution": [],
        }

    return {
        "total_predictions": int(len(df)),
        "most_common_issues": _value_counts(df, "intent"),
        "sentiment_distribution": _value_counts(df, "sentiment"),
        "category_distribution": _value_counts(df, "business_category"),
        "priority_distribution": _value_counts(df, "priority"),
    }
