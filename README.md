# AI-Powered Customer Support Ticket Classification System

End-to-end MLOps project that classifies customer tickets into:
- detailed `intent`
- mapped `business_category`
- `sentiment`
- `priority`
- `recommended_action`

It includes training, experiment tracking (MLflow), FastAPI model serving, a React (Vite) dashboard, Docker, and CI.

## Project Structure

```text
customer-support-mlops/
├── data/
├── notebooks/
├── src/
├── app/
├── frontend/
├── models/
├── artifacts/
├── logs/
├── tests/
├── mlruns/
├── .github/workflows/
├── Dockerfile
├── requirements.txt
└── README.md
```

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Keep dataset zip at `data/customer-support-intent-dataset.zip`.

## Train Model

```bash
PYTHONPATH=. python3 src/train.py
```

Saved artifacts:
- `models/model.joblib`
- `models/vectorizer.joblib`
- `models/label_encoder.joblib`
- `artifacts/metrics.json`
- `artifacts/confusion_matrix.png`

MLflow tracking directory:
- `mlruns/`

## Run API

```bash
PYTHONPATH=. uvicorn app.main:app --reload
```

### Predict Endpoint

`POST /predict`

Request:
```json
{
  "text": "I forgot my password"
}
```

Response:
```json
{
  "intent": "recover_password",
  "business_category": "Account Support",
  "sentiment": "Negative",
  "priority": "Medium",
  "confidence_score": 0.91,
  "recommended_action": "Send password reset instructions"
}
```

## Run React Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Set API endpoint (optional):

```bash
export VITE_API_BASE_URL=http://localhost:8000
```

Frontend dashboard includes:
- total predictions
- most common issues
- sentiment/category/priority distributions

## Business Category Mapping

- Complaint: `payment_issue`, `complaint`, `delivery issues`
- Inquiry: `check_invoice`, `delivery_period`, `track_order`
- Feedback: `review`
- Account Support: `recover_password`, `edit_account`, `switch_account`, `registration_problems`, `create_account`, `delete_account`
- Order Management: `cancel_order`, `place_order`, `change_order`, `change_shipping_address`
- Refund Support: `get_refund`, `track_refund`, `check_refund_policy`
- Customer Support: `contact_customer_service`, `contact_human_agent`
- Shipping Support: `delivery_options`, `set_up_shipping_address`

## Docker

```bash
docker build -t customer-support-mlops .
docker run -p 8000:8000 customer-support-mlops
```

## Testing

```bash
PYTHONPATH=. pytest -q
```

Frontend build check:

```bash
cd frontend
npm run build
```

## Optional LLM-based Recommended Actions

By default, recommendations are rule-based. You can enable LLM recommendations for:
- fallback actions (`Route ticket to customer support triage queue`)
- low-confidence model predictions

Use a `.env` file in project root (Groq example):

```bash
cp .env.example .env
```

Set Groq values in `.env`:

```bash
OPENAI_API_KEY=gsk_your_groq_api_key_here
OPENAI_MODEL=llama-3.1-8b-instant
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

You can also export variables manually before running the API:

```bash
export OPENAI_API_KEY=your_api_key
export OPENAI_MODEL=llama-3.1-8b-instant
export OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

## Notes

- Sentiment analysis uses VADER.
- Priority prediction is rule-based with critical keyword overrides.
- Recommended action is hybrid: rules first, optional LLM enhancement with safe fallback.
- Predictions are logged to `logs/predictions.csv`.
- Analytics for frontend is exposed via `GET /analytics`.
