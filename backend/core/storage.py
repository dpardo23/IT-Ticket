import os
import pandas as pd
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

MASTER_DATASET_PATH = os.path.join(DATA_DIR, "dataset_master.csv")
FEEDBACK_LOG_PATH = os.path.join(DATA_DIR, "feedback_log.csv")

VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "best_classifier.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")


def ensure_directories():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)


def load_master_dataset():
    ensure_directories()

    if not os.path.exists(MASTER_DATASET_PATH):
        return pd.DataFrame(columns=["text", "department", "timestamp"])

    return pd.read_csv(MASTER_DATASET_PATH)


def load_feedback_dataset():
    ensure_directories()

    if not os.path.exists(FEEDBACK_LOG_PATH):
        return pd.DataFrame(
            columns=["original_text", "correct_department", "timestamp"]
        )

    return pd.read_csv(FEEDBACK_LOG_PATH)


def append_feedback(original_text: str, correct_department: str):
    ensure_directories()

    feedback_row = {
        "original_text": original_text,
        "correct_department": correct_department,
        "timestamp": datetime.utcnow().isoformat()
    }

    feedback_df = pd.DataFrame([feedback_row])

    if os.path.exists(FEEDBACK_LOG_PATH):
        old = pd.read_csv(FEEDBACK_LOG_PATH)
        feedback_df = pd.concat([old, feedback_df], ignore_index=True)

    feedback_df.to_csv(FEEDBACK_LOG_PATH, index=False)

    master_row = {
        "text": original_text,
        "department": correct_department,
        "timestamp": datetime.utcnow().isoformat()
    }

    master_df = pd.DataFrame([master_row])

    if os.path.exists(MASTER_DATASET_PATH):
        old = pd.read_csv(MASTER_DATASET_PATH)
        master_df = pd.concat([old, master_df], ignore_index=True)

    master_df.to_csv(MASTER_DATASET_PATH, index=False)


def count_feedback_entries() -> int:
    return len(load_feedback_dataset())


def count_master_entries() -> int:
    return len(load_master_dataset())