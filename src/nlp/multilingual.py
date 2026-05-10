"""Multilingual detection and translation utilities."""

from dataclasses import dataclass
import json
import os

from deep_translator import GoogleTranslator
import httpx
from langdetect import detect


LANGUAGE_MAP = {"en": "English", "hi": "Hindi", "es": "Spanish"}
SUPPORTED_CODES = {"en", "hi", "es"}


@dataclass
class LanguageResult:
    detected_language: str
    translated_text: str


def detect_and_translate(text: str) -> LanguageResult:
    """Detect language and translate to English for downstream model usage."""
    try:
        code = detect(text)
    except Exception:
        code = "unknown"

    if code not in SUPPORTED_CODES:
        llm_result = _llm_detect_and_translate(text)
        if llm_result is not None:
            return llm_result
        code = "en"

    if code == "en":
        return LanguageResult(detected_language=LANGUAGE_MAP["en"], translated_text=text)

    try:
        translated = GoogleTranslator(source=code, target="en").translate(text)
        translated = translated or text
    except Exception:
        translated = text
    return LanguageResult(detected_language=LANGUAGE_MAP.get(code, "English"), translated_text=translated)


def _llm_detect_and_translate(text: str) -> LanguageResult | None:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
    model = os.getenv("OPENAI_MODEL", "llama-3.1-8b-instant")
    endpoint = f"{base_url.rstrip('/')}/chat/completions"

    payload = {
        "model": model,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "Detect the user language and translate to English. "
                    "Return strict JSON only: "
                    '{"detected_language":"<language name like German/French/Arabic/English/Hindi/Spanish>","translated_text":"..."}'
                ),
            },
            {"role": "user", "content": text},
        ],
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            detected = str(parsed.get("detected_language", "Unknown")).strip().title()
            translated = str(parsed.get("translated_text", text)).strip() or text
            if not detected:
                detected = "Unknown"
            return LanguageResult(detected_language=detected, translated_text=translated)
    except Exception:
        return None
