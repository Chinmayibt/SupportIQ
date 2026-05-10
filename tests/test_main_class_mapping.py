from src.features.main_class_mapping import map_intent_to_main_class


def test_main_class_mapping_complaint():
    assert map_intent_to_main_class("payment_issue") == "Complaint"
    assert map_intent_to_main_class("get_refund") == "Complaint"


def test_main_class_mapping_inquiry():
    assert map_intent_to_main_class("recover_password") == "Inquiry"
    assert map_intent_to_main_class("track_order") == "Inquiry"


def test_main_class_mapping_feedback():
    assert map_intent_to_main_class("review") == "Feedback"
