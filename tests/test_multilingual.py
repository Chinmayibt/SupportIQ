from src.nlp.multilingual import detect_and_translate


def test_detect_english_text():
    result = detect_and_translate("My payment is not working")
    assert result.detected_language == "English"
    assert "payment" in result.translated_text.lower()


def test_detect_hindi_text_returns_translation():
    result = detect_and_translate("मेरा भुगतान काम नहीं कर रहा है")
    assert result.detected_language in {"Hindi", "English"}
    assert isinstance(result.translated_text, str)
