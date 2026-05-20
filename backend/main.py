import time
import numpy as np
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

from core.nlp_processor import clean_text, get_tokens_list
from core.mnb_model import ITTicketClassifier, DEPARTMENTS

app = FastAPI(title="Motor NLP - IT Ticket Classification", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

model_engine = ITTicketClassifier()

class TicketManual(BaseModel):
    title: str
    description: str

class FeedbackRequest(BaseModel):
    original_text: str
    correct_department: str

def is_garbage(text: str) -> bool:
    """Validador heurístico de calidad de datos para evitar inyección de ruido."""
    text_strip = text.strip()
    if len(text_strip) < 15: return True
    words = text_strip.split()
    if len(words) < 3: return True
    if any(len(w) > 25 for w in words): return True
    # Detecta spam repetitivo (ej: "aaaaa", "11111")
    if re.search(r'(.)\1{4,}', text_strip.lower()): return True
    # Detecta baja entropía (ej: texto muy plano)
    if len(set(text_strip.lower())) < 5 and len(text_strip) > 20: return True
    return False

@app.post("/api/predict")
async def predict_single(ticket: TicketManual):
    if not model_engine.classifier:
        raise HTTPException(status_code=500, detail="El modelo no está entrenado.")
        
    full_text = ticket.title + " " + ticket.description
    
    # 1. Validación de seguridad
    if is_garbage(full_text):
        return {
            "is_garbage": True,
            "message": "Análisis Rechazado: El ticket contiene datos inválidos o carece de estructura técnica suficiente para la IA."
        }

    start_time = time.time()
    
    cleaned = clean_text(full_text)
    tokens = get_tokens_list(full_text)
    winner, probabilities, top_tfidf = model_engine.predict(cleaned)
    criticality = model_engine.get_criticality(full_text)
    
    return {
        "is_garbage": False,
        "title": ticket.title,
        "original": ticket.description,
        "tokens": tokens,
        "topTfidf": top_tfidf,
        "probabilities": probabilities,
        "winner": winner,
        "level": criticality,
        "f1Score": model_engine.global_f1,
        "optimalAlpha": model_engine.optimal_alpha,
        "bestModelName": model_engine.best_model_name,
        "confusionMatrix": model_engine.global_cm,
        "latency": int((time.time() - start_time) * 1000)
    }

@app.post("/api/feedback")
async def online_learning(feedback: FeedbackRequest):
    if feedback.correct_department not in DEPARTMENTS:
         raise HTTPException(status_code=400, detail="Departamento inválido.")
    
    cleaned = clean_text(feedback.original_text)
    model_engine.partial_fit(cleaned, feedback.correct_department)
    return {"status": "success"}

@app.post("/api/batch")
async def process_batch(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validación estricta de esquema
        required_cols = ['titulo', 'descripcion', 'departamento']
        if not all(col in df.columns for col in required_cols):
             raise HTTPException(status_code=400, detail=f"Error CSV: Debe contener exactamente: {required_cols}")
        
        df = df.fillna('')
        
        all_cleaned = [clean_text(str(r['titulo']) + " " + str(r['descripcion'])) for _, r in df.iterrows()]
        acc, f1_weight, cm, opt_alpha, best_mod = model_engine.train_batch(all_cleaned, df['departamento'].tolist())
        
        # Clasificación post-entrenamiento para métricas
        predictions = [model_engine.predict(c)[0] for c in all_cleaned]
        levels = {"Nivel 1 (Triaje Directo)": 0, "Nivel 2 (Especializado)": 0, "Nivel 3 (Crítico)": 0}
        for _, r in df.iterrows():
            levels[model_engine.get_criticality(str(r['titulo']) + " " + str(r['descripcion']))] += 1
            
        counts = pd.Series(predictions).value_counts().to_dict()
        colors = {"SysAdmins": "#FF2A4D", "SecOps / IAM": "#CC223D", "NetOps": "#99192E", "Microinformática": "#E62645", "DevOps": "#801526", "Mesa de Servicios": "#B31E36"}
        
        return {
            "processedCount": len(df),
            "f1Score": round(f1_weight * 100, 2),
            "confusionMatrix": cm,
            "optimalAlpha": opt_alpha,
            "bestModelName": best_mod,
            "departmentStats": [{"name": d, "tickets": c, "color": colors.get(d, "#FF2A4D")} for d, c in counts.items()],
            "levelStats": [{"name": k, "value": v} for k, v in levels.items()]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en procesamiento Batch: {str(e)}")