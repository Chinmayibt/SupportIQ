"""Intent to business-category mapping rules."""

from typing import Dict


BUSINESS_CATEGORY_INTENTS: Dict[str, set] = {
    "Complaint": {"payment_issue", "complaint", "delivery issues"},
    "Inquiry": {"check_invoice", "delivery_period", "track_order"},
    "Feedback": {"review"},
    "Account Support": {
        "recover_password",
        "edit_account",
        "switch_account",
        "registration_problems",
        "create_account",
        "delete_account",
    },
    "Order Management": {"cancel_order", "place_order", "change_order", "change_shipping_address"},
    "Refund Support": {"get_refund", "track_refund", "check_refund_policy"},
    "Customer Support": {"contact_customer_service", "contact_human_agent"},
    "Shipping Support": {"delivery_options", "set_up_shipping_address"},
}


def map_intent_to_business_category(intent: str) -> str:
    """Map model intent output to business category."""
    for category, intents in BUSINESS_CATEGORY_INTENTS.items():
        if intent in intents:
            return category
    return "Inquiry"
