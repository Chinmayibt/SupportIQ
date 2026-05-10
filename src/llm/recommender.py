"""LLM-backed recommendation helper with robust fallbacks."""

import json
import os
from typing import Optional

import httpx


DEFAULT_MODEL = "llama-3.1-8b-instant"


def llm_is_enabled() -> bool:
    """Enable LLM recommendations only when API key is configured."""
    return bool(os.getenv("OPENAI_API_KEY"))


def generate_llm_recommendation(
    *,
    text: str,
    intent: str,
    business_category: str,
    priority: str,
    sentiment: str,
    timeout_seconds: float = 12.0,
) -> Optional[str]:
    """
    Return a recommendation string from an OpenAI-compatible chat endpoint.

    Returns None if LLM is disabled, request fails, or response is malformed.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
    endpoint = f"{base_url.rstrip('/')}/chat/completions"

    system_prompt = (
        "You are a customer support operations assistant. "
        "Provide one concise, actionable support recommendation."
    )
    user_prompt = (
        f"Ticket text: {text}\n"
        f"Predicted intent: {intent}\n"
        f"Business category: {business_category}\n"
        f"Priority: {priority}\n"
        f"Sentiment: {sentiment}\n\n"
        "Return strict JSON only with this schema:\n"
        '{"recommended_action":"<single actionable sentence>"}'
    )

    payload = {
        "model": model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            action = parsed.get("recommended_action", "").strip()
            return action or None
    except Exception:
        return None
