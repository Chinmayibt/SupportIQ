"""Analytics helpers for frontend dashboard consumption."""

import json
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd

from src.config import MODEL_REGISTRY_PATH, PREDICTIONS_LOG_PATH
from src.features.main_class_mapping import map_intent_to_main_class
from src.monitoring.alerts import compute_alerts


def _value_counts(df: pd.DataFrame, column: str) -> List[Dict[str, Any]]:
    counts = df[column].value_counts(dropna=False).reset_index()
    counts.columns = [column, "count"]
    return counts.to_dict(orient="records")


def _empty_kpi() -> Dict[str, Any]:
    return {"total_tickets": 0, "complaints": 0, "avg_confidence": 0.0, "active_languages": 0}


def _compute_kpi(df: pd.DataFrame, language_distribution: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = int(len(df))
    complaints = int((df["main_class"] == "Complaint").sum()) if "main_class" in df.columns else 0
    if "confidence_score" in df.columns and len(df):
        conf = pd.to_numeric(df["confidence_score"], errors="coerce").dropna()
        avg_conf = float(conf.mean()) if len(conf) else 0.0
    else:
        avg_conf = 0.0
    active_languages = len(language_distribution)
    return {
        "total_tickets": total,
        "complaints": complaints,
        "avg_confidence": round(avg_conf, 4),
        "active_languages": active_languages,
    }


def _compute_ticket_trend(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if df.empty or "timestamp" not in df.columns:
        return []
    indexed = df.set_index("timestamp").sort_index()
    trend = indexed.resample("D").size().reset_index(name="count")
    trend.columns = ["timestamp", "count"]
    trend["timestamp"] = pd.to_datetime(trend["timestamp"], utc=True).dt.strftime("%Y-%m-%dT00:00:00Z")
    return trend.to_dict(orient="records")


def get_prediction_analytics() -> Dict[str, Any]:
    """Build aggregate analytics payload from prediction logs."""
    log_path = Path(PREDICTIONS_LOG_PATH)
    if not log_path.exists():
        base_payload = {
            "total_predictions": 0,
            "main_class_distribution": [],
            "sentiment_distribution": [],
            "language_distribution": [],
            "kpi": _empty_kpi(),
            "category_distribution": [],
            "ticket_trend": [],
        }
        return {**base_payload, **_model_metadata(), **compute_alerts(pd.DataFrame())}

    df = _safe_read_logs(log_path)
    if df.empty:
        base_payload = {
            "total_predictions": 0,
            "main_class_distribution": [],
            "sentiment_distribution": [],
            "language_distribution": [],
            "kpi": _empty_kpi(),
            "category_distribution": [],
            "ticket_trend": [],
        }
        return {**base_payload, **_model_metadata(), **compute_alerts(pd.DataFrame())}

    df = _normalize_dataframe_for_dashboard(df)
    df = _filter_valid_rows(df)
    if "sentiment" in df:
        df["sentiment_normalized"] = df["sentiment"].apply(_normalize_sentiment)
    else:
        df["sentiment_normalized"] = "Neutral"

    df_for_language = df.copy()
    if "detected_language" in df_for_language:
        lang_source = df_for_language["detected_language"]
    elif "language_detected" in df_for_language:
        lang_source = df_for_language["language_detected"]
    else:
        lang_source = pd.Series([""] * len(df))
    df_for_language["language_normalized"] = lang_source.apply(_normalize_language)
    df_for_language = df_for_language[df_for_language["language_normalized"] != ""]
    sentiment_distribution = _ensure_fixed_distribution(
        _value_counts(df, "sentiment_normalized"),
        "sentiment_normalized",
        ["Positive", "Negative", "Neutral"],
    )
    language_distribution = (
        _value_counts(df_for_language, "language_normalized") if not df_for_language.empty else []
    )
    language_distribution = [
        row for row in language_distribution if str(row.get("language_normalized", "")).strip().lower() != "unknown"
    ]
    class_distribution = _ensure_fixed_distribution(
        _value_counts(df, "main_class") if "main_class" in df else [],
        "main_class",
        ["Complaint", "Inquiry", "Feedback"],
    )
    category_distribution = (
        _value_counts(df, "business_category") if "business_category" in df.columns else []
    )
    ticket_trend = _compute_ticket_trend(df)
    kpi = _compute_kpi(df, language_distribution)
    return {
        "total_predictions": int(len(df)),
        "main_class_distribution": class_distribution,
        "sentiment_distribution": sentiment_distribution,
        "language_distribution": language_distribution,
        "kpi": kpi,
        "category_distribution": category_distribution,
        "ticket_trend": ticket_trend,
        **_model_metadata(),
        **compute_alerts(df),
    }


def get_recent_logs(limit: int = 30) -> List[Dict[str, Any]]:
    log_path = Path(PREDICTIONS_LOG_PATH)
    if not log_path.exists():
        return []
    df = _safe_read_logs(log_path)
    if df.empty:
        return []
    df = _normalize_dataframe_for_dashboard(df)
    df = _filter_valid_rows(df)
    if df.empty:
        return []
    return _format_recent_logs(df.tail(limit).iloc[::-1])


def get_realtime_alerts() -> Dict[str, Any]:
    log_path = Path(PREDICTIONS_LOG_PATH)
    if not log_path.exists():
        return compute_alerts(pd.DataFrame())
    df = _safe_read_logs(log_path)
    return compute_alerts(df)


def _model_metadata() -> Dict[str, Any]:
    if not Path(MODEL_REGISTRY_PATH).exists():
        return {"active_model_version": "model_v1.pkl", "last_retrained_at": None, "model_accuracy": None}
    try:
        payload = json.loads(Path(MODEL_REGISTRY_PATH).read_text(encoding="utf-8"))
        return {
            "active_model_version": payload.get("active_version"),
            "last_retrained_at": payload.get("last_retrained_at"),
            "model_accuracy": payload.get("last_accuracy"),
        }
    except Exception:
        return {"active_model_version": "model_v1.pkl", "last_retrained_at": None, "model_accuracy": None}


def _safe_read_logs(log_path: Path) -> pd.DataFrame:
    try:
        return pd.read_csv(log_path, engine="python", on_bad_lines="skip")
    except Exception:
        return pd.DataFrame()


def _normalize_sentiment(value: Any) -> str:
    if value is None:
        return "Neutral"
    text = str(value).strip().lower()
    if text.startswith("pos"):
        return "Positive"
    if text.startswith("neg"):
        return "Negative"
    if text.startswith("neu"):
        return "Neutral"
    return "Neutral"


def _normalize_language(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    lower = text.lower()
    if lower in {"en", "english"}:
        return "English"
    if lower in {"hi", "hindi"}:
        return "Hindi"
    if lower in {"es", "spanish"}:
        return "Spanish"
    if not text:
        return ""
    return text.title()


def _filter_valid_rows(df: pd.DataFrame) -> pd.DataFrame:
    clean = df.copy()
    if "priority" in clean.columns:
        valid_priorities = {"Low", "Medium", "High", "Critical"}
        clean = clean[clean["priority"].isin(valid_priorities)]
    if "main_class" in clean.columns:
        valid_classes = {"Complaint", "Inquiry", "Feedback"}
        clean = clean[clean["main_class"].isin(valid_classes)]
    return clean


def _normalize_dataframe_for_dashboard(df: pd.DataFrame) -> pd.DataFrame:
    clean = df.copy()
    if "timestamp" in clean.columns:
        clean["timestamp"] = pd.to_datetime(clean["timestamp"], errors="coerce", utc=True)
        clean = clean.dropna(subset=["timestamp"])

    if "intent" not in clean.columns:
        clean["intent"] = None
    if "main_class" not in clean.columns:
        clean["main_class"] = None

    clean["main_class"] = clean["main_class"].fillna(clean["intent"].apply(_derive_main_class_from_intent))

    # Backward compatibility for older logs that used `assigned_team`.
    if "action_source" not in clean.columns:
        clean["action_source"] = None
    if "assigned_team" in clean.columns:
        clean["action_source"] = clean["action_source"].fillna(clean["assigned_team"])

    return clean


def _derive_main_class_from_intent(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    derived = map_intent_to_main_class(text)
    if derived in {"Complaint", "Inquiry", "Feedback"}:
        return derived
    return None


def _ensure_fixed_distribution(
    rows: List[Dict[str, Any]],
    label_key: str,
    labels: List[str],
) -> List[Dict[str, Any]]:
    counts = {str(row.get(label_key)): int(row.get("count", 0)) for row in rows}
    return [{label_key: label, "count": counts.get(label, 0)} for label in labels]


def _format_recent_logs(df: pd.DataFrame) -> List[Dict[str, Any]]:
    output_columns = [
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
    frame = df.copy()
    if "detected_language" not in frame.columns and "language_detected" in frame.columns:
        frame["detected_language"] = frame["language_detected"]
    for column in output_columns:
        if column not in frame.columns:
            frame[column] = None
    frame["timestamp"] = frame["timestamp"].astype(str)
    return frame[output_columns].to_dict(orient="records")
