import hashlib

from core.constants import DEPARTMENTS
from core.nlp_processor import preprocess_text
from core.storage import append_feedback, load_feedback_dataset


def normalize_label(label: str) -> str:
    if not label:
        return ""

    label = str(label).strip()

    for d in DEPARTMENTS:
        if d.lower() == label.lower():
            return d

    return ""


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def is_duplicate_feedback(original_text: str, label: str) -> bool:
    df = load_feedback_dataset()

    if len(df) == 0:
        return False

    original_text = str(original_text).strip()
    label = str(label).strip()

    hashed = hash_text(original_text + "::" + label)

    df["hash"] = (
        df["original_text"].astype(str).str.strip()
        + "::"
        + df["correct_department"].astype(str).str.strip()
    )

    df["hash"] = df["hash"].apply(hash_text)

    return hashed in set(df["hash"].tolist())


def register_feedback(original_text: str, correct_department: str):
    label = normalize_label(correct_department)

    if not label:
        raise ValueError("Departamento inválido.")

    original_text = str(original_text).strip()

    if len(original_text) < 10:
        raise ValueError("Texto demasiado corto.")

    if is_duplicate_feedback(original_text, label):
        raise ValueError("Feedback duplicado.")

    cleaned_text, _ = preprocess_text(original_text)

    if len(cleaned_text) < 5:
        raise ValueError("Texto inválido.")

    append_feedback(original_text, label)

    return cleaned_text