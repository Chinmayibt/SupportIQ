"""Advanced recommended action orchestration."""

from dataclasses import dataclass

from src.features.rules import DEFAULT_RECOMMENDED_ACTION, fallback_action_for_main_class, recommend_action
from src.llm.recommender import generate_llm_recommendation, llm_is_enabled


@dataclass
class ActionResult:
    recommended_action: str
    action_source: str


def resolve_recommended_action(
    *,
    text: str,
    intent: str,
    business_category: str,
    main_class: str,
    priority: str,
    sentiment: str,
    confidence_score: float,
) -> ActionResult:
    """Resolve deterministic action first, then optional LLM enhancement."""
    rule_action = recommend_action(intent)
    should_try_llm = rule_action == DEFAULT_RECOMMENDED_ACTION or confidence_score < 0.7

    if llm_is_enabled() and should_try_llm:
        llm_action = generate_llm_recommendation(
            text=text,
            intent=intent,
            business_category=business_category,
            priority=priority,
            sentiment=sentiment,
        )
        if llm_action:
            return ActionResult(recommended_action=llm_action, action_source="llm")

    if rule_action == DEFAULT_RECOMMENDED_ACTION:
        return ActionResult(recommended_action=fallback_action_for_main_class(main_class), action_source="rules")
    return ActionResult(recommended_action=rule_action, action_source="rules")
