import importlib
import sys
import types
from pathlib import Path

from fastapi.testclient import TestClient

project_root = Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
pkg = types.ModuleType("app")
pkg.__path__ = [str(project_root / "app")]
sys.modules["app"] = pkg

main_module = importlib.import_module("app.main")
app = main_module.app


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_contract():
    with TestClient(app) as client:
        response = client.post("/predict", json={"text": "My payment failed twice and I need help."})
    assert response.status_code == 200
    payload = response.json()
    for key in [
        "main_class",
        "intent",
        "business_category",
        "sentiment",
        "priority",
        "confidence_score",
        "recommended_action",
        "detected_language",
        "translated_text",
        "action_source",
    ]:
        assert key in payload
    assert payload["main_class"] in {"Complaint", "Inquiry", "Feedback"}


def test_analytics_contract():
    with TestClient(app) as client:
        response = client.get("/analytics")
    assert response.status_code == 200
    payload = response.json()
    for key in [
        "total_predictions",
        "main_class_distribution",
        "sentiment_distribution",
        "language_distribution",
        "kpi",
        "category_distribution",
        "ticket_trend",
    ]:
        assert key in payload


def test_alerts_and_recent_logs_contract():
    with TestClient(app) as client:
        alerts_res = client.get("/alerts")
        logs_res = client.get("/logs/recent")
        status_res = client.get("/model/status")

    assert alerts_res.status_code == 200
    assert logs_res.status_code == 200
    assert status_res.status_code == 200


def test_audio_predict_contract(monkeypatch):
    monkeypatch.setattr(main_module, "transcribe_audio_file", lambda _path: "My payment failed during checkout")
    with TestClient(app) as client:
        response = client.post("/predict/audio", files={"file": ("sample.wav", b"fake-bytes", "audio/wav")})
    assert response.status_code == 200
    payload = response.json()
    assert payload["transcript_text"] == "My payment failed during checkout"
