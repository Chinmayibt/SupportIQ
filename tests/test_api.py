from fastapi.testclient import TestClient

from app.main import app


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
    for key in ["intent", "business_category", "sentiment", "priority", "confidence_score", "recommended_action"]:
        assert key in payload


def test_analytics_contract():
    with TestClient(app) as client:
        response = client.get("/analytics")
    assert response.status_code == 200
    payload = response.json()
    for key in [
        "total_predictions",
        "most_common_issues",
        "sentiment_distribution",
        "category_distribution",
        "priority_distribution",
    ]:
        assert key in payload
