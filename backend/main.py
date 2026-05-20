from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd
import time

from core.model_engine import ITTicketClassifierEngine
from core.nlp_processor import preprocess_text
from core.storage import (
    load_master_dataset,
    append_feedback
)

# ======================================================
# APP
# ======================================================

app = FastAPI(title="AI Ticket Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# ENGINE
# ======================================================

engine = ITTicketClassifierEngine()

# ======================================================
# REQUEST MODELS
# ======================================================

class PredictRequest(BaseModel):
    title: str
    description: str


class FeedbackRequest(BaseModel):
    original_text: str
    correct_department: str


# ======================================================
# HELPERS
# ======================================================

def normalize_probabilities(results):
    """
    Convierte:
    [
        {"name":"Redes","value":92}
    ]

    a:

    {
        "Redes":0.92
    }
    """

    probs = {}

    for item in results:
        name = item.get("name")
        value = item.get("value", 0)

        try:
            probs[name] = float(value) / 100.0
        except:
            probs[name] = 0.0

    return probs


def normalize_tfidf(top_tfidf):
    """
    Convierte:
    token -> term
    """

    normalized = []

    for item in top_tfidf:
        normalized.append({
            "term": item.get("token", ""),
            "weight": item.get("weight", 0)
        })

    return normalized


# ======================================================
# HEALTH
# ======================================================

@app.get("/")
def root():
    return {
        "status": "ok",
        "model_ready": engine.is_ready(),
        "model": engine.best_model_name
    }


# ======================================================
# PREDICT
# ======================================================

@app.post("/api/predict")
def predict(req: PredictRequest):

    if not engine.is_ready():
        raise HTTPException(
            status_code=500,
            detail="Modelo no entrenado."
        )

    start = time.time()

    original_text = f"{req.title}\n{req.description}"

    # NLP
    cleaned_text, tokens = preprocess_text(original_text)

    # heurística basura
    if len(tokens) < 2:
        return {
            "is_garbage": True,
            "message": "Texto inválido o insuficiente."
        }

    # inferencia
    winner, results, top_tfidf = engine.predict(cleaned_text)

    latency = int((time.time() - start) * 1000)

    return {
        "winner": winner,

        # FRONTEND SAFE
        "probabilities": normalize_probabilities(results),

        "tokens": tokens,

        "latency": latency,

        "level": engine.get_criticality(original_text),

        # NUEVOS CAMPOS
        "originalText": original_text,
        "cleanText": cleaned_text,

        # FRONTEND SAFE
        "topTfidf": normalize_tfidf(top_tfidf),

        "is_garbage": False
    }


# ======================================================
# FEEDBACK
# ======================================================

@app.post("/api/feedback")
def feedback(req: FeedbackRequest):

    original_text = req.original_text
    correct_department = req.correct_department

    cleaned_text, _ = preprocess_text(original_text)

    # guardar feedback
    append_feedback(original_text, correct_department)

    # aprendizaje incremental
    learned_immediately = engine.partial_fit(
        cleaned_text,
        correct_department
    )

    retrained_batch = False

    # retraining automático
    if engine.should_retrain_due_feedback():
        master_df = load_master_dataset()

        texts = master_df["text"].tolist()
        labels = master_df["department"].tolist()

        engine.train_batch_from_dataset(texts, labels)

        retrained_batch = True

    return {
        "success": True,
        "learnedImmediately": learned_immediately,
        "retrainedBatch": retrained_batch,
        "message": "Feedback procesado correctamente."
    }


# ======================================================
# BATCH
# ======================================================

@app.post("/api/batch")
async def batch(file: UploadFile = File(...)):

    if not engine.is_ready():
        raise HTTPException(
            status_code=500,
            detail="Modelo no entrenado."
        )

    start = time.time()

    try:
        df = pd.read_csv(file.file)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="CSV inválido."
        )

    if "text" not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="El CSV debe contener columna 'text'"
        )

    processed = 0
    rejected = 0

    distribution = {}

    clean_texts = []
    labels = []

    for text in df["text"].fillna(""):

        cleaned_text, tokens = preprocess_text(str(text))

        if len(tokens) < 2:
            rejected += 1
            continue

        winner, _, _ = engine.predict(cleaned_text)

        distribution[winner] = distribution.get(winner, 0) + 1

        clean_texts.append(cleaned_text)
        labels.append(winner)

        processed += 1

    # métricas reales usando dataset maestro
    master_df = load_master_dataset()

    training_result = engine.train_batch_from_dataset(
        master_df["text"].tolist(),
        master_df["department"].tolist()
    )

    speed = int((time.time() - start) * 1000)

    return {
        "totalTickets": len(df),
        "processedCount": processed,
        "rejectedCount": rejected,

        "f1Score": training_result["f1Score"] / 100.0,
        "accuracy": training_result["accuracy"] / 100.0,

        "bestModelName": training_result["bestModelName"],
        "optimalAlpha": training_result["optimalAlpha"],

        "confusionMatrix": training_result["confusionMatrix"],

        "labels": list(distribution.keys()),

        "departmentDistribution": distribution,

        "globalTfidf": training_result["globalTfidf"],

        "speed": speed
    }