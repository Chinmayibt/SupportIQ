"""Real-time alert and trend calculations."""

from datetime import timedelta
from typing import Dict

import pandas as pd

from src.config import ALERT_WINDOW_MINUTES, COMPLAINT_SPIKE_THRESHOLD, CRITICAL_INCIDENT_THRESHOLD


def compute_alerts(df: pd.DataFrame) -> Dict[str, object]:
    if df.empty or "timestamp" not in df:
        return {
            "complaint_spike_detected": False,
            "high_priority_incident_detected": False,
            "complaints_last_window": 0,
            "critical_last_window": 0,
            "window_minutes": ALERT_WINDOW_MINUTES,
        }

    frame = df.copy()
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], errors="coerce", utc=True)
    frame = frame.dropna(subset=["timestamp"])
    if frame.empty:
        return {
            "complaint_spike_detected": False,
            "high_priority_incident_detected": False,
            "complaints_last_window": 0,
            "critical_last_window": 0,
            "window_minutes": ALERT_WINDOW_MINUTES,
        }

    now = frame["timestamp"].max()
    window_start = now - timedelta(minutes=ALERT_WINDOW_MINUTES)
    recent = frame[frame["timestamp"] >= window_start]

    complaints = int((recent["business_category"] == "Complaint").sum()) if "business_category" in recent else 0
    critical = int((recent["priority"] == "Critical").sum()) if "priority" in recent else 0

    return {
        "complaint_spike_detected": complaints >= COMPLAINT_SPIKE_THRESHOLD,
        "high_priority_incident_detected": critical >= CRITICAL_INCIDENT_THRESHOLD,
        "complaints_last_window": complaints,
        "critical_last_window": critical,
        "window_minutes": ALERT_WINDOW_MINUTES,
    }
