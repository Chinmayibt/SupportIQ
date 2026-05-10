"""Rule engines for priority and recommended actions."""

from typing import Dict


RECOMMENDED_ACTIONS: Dict[str, str] = {
    "payment_issue": "Escalate to billing support team",
    "recover_password": "Send password reset instructions",
    "cancel_order": "Forward request to order management",
    "review": "Store feedback for analytics",
}
DEFAULT_RECOMMENDED_ACTION = "Route ticket to customer support triage queue"

HIGH_PRIORITY_INTENTS = {"payment_issue", "complaint", "get_refund", "track_refund", "check_refund_policy"}
MEDIUM_PRIORITY_INTENTS = {"change_order", "change_shipping_address", "delivery_options", "set_up_shipping_address"}
LOW_PRIORITY_INTENTS = {"review", "check_invoice", "delivery_period", "track_order"}


def predict_priority(intent: str, text: str) -> str:
    """Infer ticket priority using intent and critical keyword overrides."""
    content = text.lower()
    critical_keywords = ["fraud", "payment failure", "account hacked", "hacked"]
    if any(keyword in content for keyword in critical_keywords):
        return "Critical"
    if intent in HIGH_PRIORITY_INTENTS:
        return "High"
    if intent in MEDIUM_PRIORITY_INTENTS:
        return "Medium"
    if intent in LOW_PRIORITY_INTENTS:
        return "Low"
    return "Medium"


def recommend_action(intent: str) -> str:
    """Return automation recommendation based on intent."""
    return RECOMMENDED_ACTIONS.get(intent, DEFAULT_RECOMMENDED_ACTION)
