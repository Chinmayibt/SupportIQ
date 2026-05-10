# Runtime image: copy a trained `models/sklearn_classifier/latest/classifier.joblib` into the image
# or mount it at run time. Train locally or in CI artifact, then docker build --build-arg or COPY.

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/requirements.txt
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app/backend
COPY training /app/training

ENV PYTHONPATH=/app/backend
ENV MODEL_PATH=/app/models/sklearn_classifier/latest/classifier.joblib

EXPOSE 8000

WORKDIR /app/backend
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
