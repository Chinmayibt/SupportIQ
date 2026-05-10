from src.features.business_mapping import map_intent_to_business_category
from src.features.rules import predict_priority, recommend_action


def test_business_category_mapping():
    assert map_intent_to_business_category("recover_password") == "Account Support"
    assert map_intent_to_business_category("review") == "Feedback"


def test_priority_rules():
    assert predict_priority("review", "good service") == "Low"
    assert predict_priority("track_order", "my account hacked yesterday") == "Critical"
    assert predict_priority("payment_issue", "payment failed twice") == "High"


def test_recommended_actions():
    assert recommend_action("payment_issue") == "Escalate to billing support team"
    assert recommend_action("cancel_order") == "Forward request to order management"
