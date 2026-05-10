"""Text cleaning and weak supervision labels for training on TWCS-style data."""

import re
import string


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()
    # Common typos that break phrase rules (e.g. "is there" → "is therea")
    text = re.sub(r"\btherea\b", "there", text)
    text = re.sub(r"\btheres\b", "there is", text)
    return text


def inquiry_cues(text: str) -> bool:
    """
    Strong signals for product / availability questions (used in labels + inference).
    """
    t = text.lower()
    if re.search(r"\bis\s+ther\w+", t):
        return True
    phrases = (
        "any other",
        "other color",
        "other colours",
        "another color",
        "different color",
        "different size",
        "other size",
        "same product",
        "other options",
        "other styles",
        "what colors",
        "which colors",
        "which sizes",
        "do you have",
        "can i get",
        "is it available",
        "in stock",
        "still available",
        "any alternatives",
    )
    return any(p in t for p in phrases)


def weak_label(text: str) -> str:
    """Rule-based pseudo-labels for training (complaint | inquiry | feedback)."""
    text = text.lower()
    complaint_keywords = [
        "not working",
        "worst",
        "bad",
        "issue",
        "problem",
        "error",
        "late",
        "delay",
        "slow",
        "terrible",
        "ridiculous",
        "frustrated",
        "angry",
        "cancel",
        "refund",
        "broken",
        "fail",
        "failed",
        "cant",
        "can't",
        "down",
        "outage",
    ]
    inquiry_keywords = [
        "how",
        "what",
        "why",
        "when",
        "where",
        "can you",
        "is there",
        "are there",
        "do you",
        "does",
        "did",
        "will",
        "would",
        "could",
    ]
    if any(w in text for w in complaint_keywords):
        return "complaint"
    if (
        inquiry_cues(text)
        or any(w in text for w in inquiry_keywords)
        or text.startswith(("is ", "are ", "do ", "does ", "can ", "will "))
    ):
        return "inquiry"
    return "feedback"
