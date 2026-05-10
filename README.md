# AI-Based Customer Support Classifier

**Focus:** Text classification  
**Classes:** `complaint`, `inquiry`, `feedback`  
**Data:** [Customer support / TWCS-style](data/raw/twcs.csv) — inbound tweets only for training.

## Stack

| Part | Tech |
|------|------|
| API | FastAPI + scikit-learn (TF–IDF + logistic regression) |
| Training | `training/train.py` + MLflow (local `mlruns/`) |
| UI | React + Vite |
| Dataset | `data/raw/twcs.csv` (only committed raw artifact) |

Weak supervision uses keyword rules to label a sample of inbound messages, then trains a linear model on cleaned text. Replace with human-labeled data for production quality.

## MLOps flow

1. **Data** — Raw TWCS CSV in `data/raw/`. Optional caches can live in `data/processed/`.
2. **Train** — `python training/train.py` fits the pipeline, logs params/metrics to MLflow, writes `models/sklearn_classifier/<run_id>/classifier.joblib`, copies to `models/sklearn_classifier/latest/classifier.joblib`, and writes `latest/manifest.json` (includes MLflow run id).
3. **Track** — `mlflow ui --backend-store-uri file:$(pwd)/mlruns` from the repo root to browse runs.
4. **Serve** — API loads the model from `MODEL_PATH` (default: latest path above, with fallback to `backend/classifier.joblib` if present).
5. **Observe** — Optional CSV logging to `backend/prediction_logs.csv` (toggle with `PREDICTION_LOGGING`). Summary counts: `GET /api/metrics/summary`.

**Promoting a model:** Training already copies the new artifact to `latest/`. To pin a specific run, set `MODEL_PATH` to `models/sklearn_classifier/<run_id>/classifier.joblib` or copy that file over `latest/`.

## Quick start

### 1. Python environment

```bash
cd /path/to/MLops
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train the classifier

Requires `data/raw/twcs.csv` locally.

```bash
python training/train.py
```

Optional evaluation on a small CSV (used in CI):

```bash
python training/evaluate.py --fixture tests/fixtures/tiny_labeled.csv
```

The legacy entrypoint `python backend/train_model.py` delegates to `training/train.py`.

### 3. Run the API

```bash
cd backend
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Environment variables:

| Variable | Purpose |
|----------|---------|
| `MODEL_PATH` | Path to `classifier.joblib` (absolute or relative to repo root) |
| `MODEL_VERSION` | Optional label shown in `/api/health` if no `manifest.json` |
| `PREDICTION_LOGGING` | `true` / `false` — append prediction rows to CSV |
| `PREDICTION_LOG_PATH` | Override log file (default `backend/prediction_logs.csv`) |

Endpoints:

- Health: `GET http://127.0.0.1:8000/api/health` (includes `model_path`, `model_version`, manifest when present)  
- Predict: `POST http://127.0.0.1:8000/api/predict` with JSON `{"text":"..."}`  
- Metrics: `GET http://127.0.0.1:8000/api/metrics/summary`  
- Docs: `http://127.0.0.1:8000/docs`

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE` if the API is not on `127.0.0.1:8000`.

### 5. Docker (optional)

Train locally first so `models/sklearn_classifier/latest/classifier.joblib` exists, then:

```bash
docker compose up --build
```

Mount or copy `models/` so the container sees the artifact (see `docker-compose.yml`).

## CI

GitHub Actions installs `requirements.txt` and runs `pytest` using fixtures only (no full `twcs.csv` required on the runner).

## Project layout

```
MLops/
├── data/
│   ├── raw/twcs.csv
│   └── processed/           # optional caches (.gitkeep)
├── models/sklearn_classifier/   # versioned joblibs (gitignored)
├── mlruns/                # MLflow file store (gitignored)
├── training/
│   ├── config.py
│   ├── train.py
│   └── evaluate.py
├── backend/
│   ├── app.py
│   ├── preprocess.py
│   ├── train_model.py     # delegates to training/train.py
│   └── requirements.txt
├── monitoring/README.md   # placeholder for dashboards / drift
├── tests/fixtures/        # tiny CSV for CI
└── frontend/
```

## License / data

Use the TWCS dataset according to its original license and citation requirements.
