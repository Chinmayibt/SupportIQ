# Monitoring (placeholder)

This folder is reserved for future observability work:

- Dashboards (Grafana, cloud-native metrics) wired to API latency and error rates.
- Drift detection on logged predictions (`backend/prediction_logs.csv` or a warehouse).
- Alerting when `/api/metrics/summary` category mix shifts materially.

Today, lightweight metrics are available via `GET /api/metrics/summary` on the API.
