"""Top-level 3-class mapping for predicted intents."""

MAIN_CLASS_BY_INTENT = {
    # Complaint
    "payment_issue": "Complaint",
    "complaint": "Complaint",
    "delivery issues": "Complaint",
    "get_refund": "Complaint",
    "track_refund": "Complaint",
    "check_refund_policy": "Complaint",
    # Feedback
    "review": "Feedback",
    # Inquiry (default support and informational intents)
    "check_invoice": "Inquiry",
    "delivery_period": "Inquiry",
    "track_order": "Inquiry",
    "recover_password": "Inquiry",
    "edit_account": "Inquiry",
    "switch_account": "Inquiry",
    "registration_problems": "Inquiry",
    "create_account": "Inquiry",
    "delete_account": "Inquiry",
    "cancel_order": "Inquiry",
    "place_order": "Inquiry",
    "change_order": "Inquiry",
    "change_shipping_address": "Inquiry",
    "contact_customer_service": "Inquiry",
    "contact_human_agent": "Inquiry",
    "delivery_options": "Inquiry",
    "set_up_shipping_address": "Inquiry",
}


def map_intent_to_main_class(intent: str) -> str:
    """Map intent to one of: Complaint, Inquiry, Feedback."""
    return MAIN_CLASS_BY_INTENT.get(intent, "Inquiry")
