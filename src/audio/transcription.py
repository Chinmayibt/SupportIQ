"""Audio transcription via Groq Whisper-compatible API."""

from pathlib import Path
from typing import Optional

import httpx

from src.config import GROQ_WHISPER_MODEL, OPENAI_API_KEY, OPENAI_BASE_URL

def transcribe_audio_file(audio_path: Path, timeout_seconds: float = 30.0) -> Optional[str]:
    """Transcribe local audio file using Groq's OpenAI-compatible endpoint."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured for Groq transcription.")

    endpoint = f"{OPENAI_BASE_URL.rstrip('/')}/audio/transcriptions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

    with audio_path.open("rb") as audio_file:
        files = {"file": (audio_path.name, audio_file, "application/octet-stream")}
        data = {"model": GROQ_WHISPER_MODEL}
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.post(endpoint, headers=headers, files=files, data=data)
            response.raise_for_status()
            payload = response.json()
            return payload.get("text")
