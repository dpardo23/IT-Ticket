import re
import unicodedata

STOPWORDS = {
    "de",
    "la",
    "el",
    "los",
    "las",
    "y",
    "o",
    "u",
    "a",
    "ante",
    "con",
    "sin",
    "por",
    "para",
    "en",
    "un",
    "una",
    "unos",
    "unas",
    "que",
    "se",
    "del",
    "al",
    "es",
    "son",
}


def normalize_text(text: str) -> str:
    text = text.lower()

    text = unicodedata.normalize("NFD", text)
    text = text.encode("ascii", "ignore").decode("utf-8")

    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def tokenize(text: str) -> list[str]:
    return text.split()


def remove_stopwords(tokens: list[str]) -> list[str]:
    return [t for t in tokens if t not in STOPWORDS and len(t) > 2]


def preprocess_text(text: str):
    normalized = normalize_text(text)

    tokens = tokenize(normalized)

    clean_tokens = remove_stopwords(tokens)

    clean_text = " ".join(clean_tokens)

    return clean_text, clean_tokens