# AI-Powered Customer Support Intelligence Platform

Advanced MLOps platform for intelligent support automation using a hierarchical output:
- **main_class** (3 classes): `Complaint`, `Inquiry`, `Feedback`
- **intent** as subclass under the main class

## Core + Advanced Capabilities

- Intent classification (`utterance` -> `intent`)
- 3-class hierarchy output (`main_class` + `intent`)
- Business category mapping
- Sentiment + priority prediction
- Hybrid recommended actions (rules + Groq LLM fallback)
- Multilingual workflow (English, Hindi, Spanish)
- Voice ticket support (Groq Whisper STT)
- Real-time analytics, alerts, trends, KPI cards
- Automated retraining + model versioning + MLflow history
- React-only frontend

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Dataset zip should exist at `data/customer-support-intent-dataset.zip`.

## Environment Configuration

```bash
cp .env.example .env
```

Required Groq fields:

```bash
OPENAI_API_KEY=gsk_your_groq_api_key_here
OPENAI_MODEL=llama-3.1-8b-instant
OPENAI_BASE_URL=https://api.groq.com/openai/v1
GROQ_WHISPER_MODEL=whisper-large-v3
```

## Train / Retrain

```bash
PYTHONPATH=. python src/train.py
PYTHONPATH=. python src/retrain.py
```

Retraining creates versioned models (`model_v1.pkl`, `model_v2.pkl`, ...) and updates `models/model_registry.json`.

## Run Services

### FastAPI
```bash
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### React dashboard
```bash
cd frontend
npm install
npm run dev
```

## Main API Endpoints

- `POST /predict` - text inference
- `POST /predict/audio` - audio upload (`mp3`/`wav`) inference
- `GET /analytics` - realtime KPI + charts payload
- `GET /alerts` - complaint spike / critical incident alerts
- `GET /logs/recent` - rolling prediction logs
- `GET /model/status` - active model version and health

## Sample Response

```json
{
  "main_class": "Complaint",
  "detected_language": "Hindi",
  "translated_text": "My payment is not working",
  "transcript_text": null,
  "intent": "payment_issue",
  "business_category": "Complaint",
  "sentiment": "Negative",
  "priority": "High",
  "confidence_score": 0.91,
  "recommended_action": "Escalate ticket to Billing Support Team",
  "action_source": "llm"
}
```

## CI/CD + Scheduled Retraining

- CI: `.github/workflows/ci.yml` (tests, retrain validation, frontend build, docker build)
- Scheduled retraining:
  - `.github/workflows/retrain-daily.yml`
  - `.github/workflows/retrain-weekly.yml`
  - `.github/workflows/retrain-monthly.yml`

## Testing

```bash
PYTHONPATH=. pytest -q
```
