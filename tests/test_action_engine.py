from src.features.action_engine import resolve_recommended_action


def test_action_engine_rule_path(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    result = resolve_recommended_action(
        text="I forgot my password",
        intent="recover_password",
        business_category="Account Support",
        main_class="Inquiry",
        priority="Medium",
        sentiment="Negative",
        confidence_score=0.95,
    )
    assert result.action_source == "rules"
    assert "password" in result.recommended_action.lower()
