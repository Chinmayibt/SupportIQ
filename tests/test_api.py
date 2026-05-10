from __future__ import annotations


def test_health_includes_model_path(live_app):
    client, app_mod, _log = live_app
    path = app_mod.resolved_model_path()
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["model_ready"] is True
    assert data["model_path"] == str(path)


def test_predict_and_metrics(live_app):
    client, _app_mod, log = live_app
    r = client.post("/api/predict", json={"text": "I want a refund"})
    assert r.status_code == 200
    body = r.json()
    assert body["category"] in {"complaint", "inquiry", "feedback"}
    assert "probabilities" in body

    m = client.get("/api/metrics/summary")
    assert m.status_code == 200
    summary = m.json()
    assert summary["prediction_rows"] >= 1
    assert summary["counts_by_category"].get(body["category"], 0) >= 1
    assert log.is_file()
