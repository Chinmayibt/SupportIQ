"""Reusable text preprocessing utilities powered by NLTK."""

import re
import string
from functools import lru_cache
from typing import List

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize


@lru_cache(maxsize=1)
def _bootstrap_nltk() -> None:
    resources = ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4", "vader_lexicon"]
    for resource in resources:
        nltk.download(resource, quiet=True)


def preprocess_text(text: str) -> str:
    """Apply lowercase, cleanup, tokenization, stopword removal, lemmatization."""
    _bootstrap_nltk()
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words("english"))

    lowered = text.lower()
    no_punct = lowered.translate(str.maketrans("", "", string.punctuation))
    cleaned = re.sub(r"[^a-z0-9\s]", " ", no_punct)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    tokens = word_tokenize(cleaned)
    normalized: List[str] = [
        lemmatizer.lemmatize(token) for token in tokens if token not in stop_words and token.strip()
    ]
    return " ".join(normalized)
