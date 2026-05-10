import os

from src.llm.recommender import llm_is_enabled


def test_llm_disabled_without_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    assert llm_is_enabled() is False


def test_llm_enabled_with_api_key(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "dummy")
    assert llm_is_enabled() is True
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
