import os
import json
import joblib
import time
from datetime import datetime

from core.constants import DEPARTMENTS
from core.storage import (
    ensure_directories,
    VECTORIZER_PATH,
    MODEL_PATH,
    METADATA_PATH,
    load_master_dataset,
    load_feedback_dataset
)
from core.training import train_best_model, compute_global_tfidf


class ITTicketClassifierEngine:
    """
    Motor principal de IA.
    Implementa:
    - Inferencia
    - Entrenamiento batch (GridSearch + KFold)
    - Persistencia en disco
    - Aprendizaje online (partial_fit si aplica)
    """

    def __init__(self):
        self.vectorizer = None
        self.model = None

        self.best_model_name = "No Entrenado"
        self.best_params = {}
        self.global_f1 = 0.0
        self.global_accuracy = 0.0
        self.global_cm = [[0] * len(DEPARTMENTS) for _ in range(len(DEPARTMENTS))]

        self.last_retrain_feedback_count = 0

        ensure_directories()
        self.load_models()

    def load_models(self):
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            self.vectorizer = joblib.load(VECTORIZER_PATH)
            data = joblib.load(MODEL_PATH)

            if isinstance(data, dict) and "model" in data:
                self.model = data["model"]
                self.best_model_name = data.get("name", "Desconocido")
                self.best_params = data.get("params", {})
                self.global_f1 = data.get("f1_score", 0.0)
                self.global_accuracy = data.get("accuracy", 0.0)
                self.global_cm = data.get("confusion_matrix", self.global_cm)
                self.last_retrain_feedback_count = data.get("last_retrain_feedback_count", 0)
            else:
                self.model = data

            print("[ENGINE] Modelo cargado desde disco.")
        else:
            print("[ENGINE] No se encontraron modelos guardados.")

    def save_models(self):
        ensure_directories()

        joblib.dump(self.vectorizer, VECTORIZER_PATH)

        joblib.dump({
            "model": self.model,
            "name": self.best_model_name,
            "params": self.best_params,
            "f1_score": self.global_f1,
            "accuracy": self.global_accuracy,
            "confusion_matrix": self.global_cm,
            "last_retrain_feedback_count": self.last_retrain_feedback_count
        }, MODEL_PATH)

        master_df = load_master_dataset()
        feedback_df = load_feedback_dataset()

        metadata = {
            "saved_at": datetime.utcnow().isoformat(),
            "model_name": self.best_model_name,
            "params": self.best_params,
            "f1_score": self.global_f1,
            "accuracy": self.global_accuracy,
            "dataset_size": int(len(master_df)),
            "feedback_count": int(len(feedback_df)),
            "last_retrain_feedback_count": int(self.last_retrain_feedback_count)
        }

        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)

    def is_ready(self) -> bool:
        return self.vectorizer is not None and self.model is not None

    def predict(self, cleaned_text: str):
        X_vec = self.vectorizer.transform([cleaned_text])
        probas = self.model.predict_proba(X_vec)[0]

        results = []
        for class_name, prob in zip(self.model.classes_, probas):
            results.append({"name": class_name, "value": round(float(prob) * 100, 2)})

        results.sort(key=lambda x: x["value"], reverse=True)
        winner = results[0]["name"]

        feature_names = self.vectorizer.get_feature_names_out()
        tfidf_scores = X_vec.toarray()[0]
        top_indices = tfidf_scores.argsort()[-5:][::-1]

        top_tfidf = []
        for i in top_indices:
            if tfidf_scores[i] > 0:
                top_tfidf.append({
                    "token": feature_names[i],
                    "weight": round(float(tfidf_scores[i]), 6)
                })

        return winner, results, top_tfidf

    def partial_fit(self, cleaned_text: str, correct_department: str):
        """
        Aprendizaje inmediato (solo si el modelo soporta partial_fit).
        """
        if not self.is_ready():
            return False

        X_vec = self.vectorizer.transform([cleaned_text])

        if hasattr(self.model, "partial_fit"):
            self.model.partial_fit(X_vec, [correct_department], classes=DEPARTMENTS)
            self.save_models()
            return True

        return False

    def train_batch_from_dataset(self, texts, labels):
        """
        Entrenamiento batch completo con CV + GridSearch.
        """
        start = time.time()

        result = train_best_model(texts, labels)

        self.vectorizer = result["vectorizer"]
        self.model = result["model"]
        self.best_model_name = result["model_name"]
        self.best_params = result["best_params"]

        # f1_real = CV prediction-based metric (no optimistic)
        self.global_f1 = round(result["f1_real"] * 100, 2)
        self.global_accuracy = round(result["accuracy"] * 100, 2)
        self.global_cm = result["confusion_matrix"]

        # Marcar cuántos feedbacks se usaron en el último reentrenamiento
        self.last_retrain_feedback_count = len(load_feedback_dataset())

        self.save_models()

        X_matrix = self.vectorizer.transform(texts)
        global_tfidf = compute_global_tfidf(self.vectorizer, X_matrix, top_n=15)

        duration_ms = int((time.time() - start) * 1000)

        # Definir "optimalAlpha" solo si aplica
        optimal_alpha = None
        if "alpha" in self.best_params:
            optimal_alpha = self.best_params["alpha"]

        return {
            "accuracy": self.global_accuracy,
            "f1Score": self.global_f1,
            "confusionMatrix": self.global_cm,
            "bestModelName": self.best_model_name,
            "bestParams": self.best_params,
            "optimalAlpha": optimal_alpha,
            "trainingTimeMs": duration_ms,
            "globalTfidf": global_tfidf,
            "candidateModels": result["candidates"]
        }

    def should_retrain_due_feedback(self, threshold: int = 20) -> bool:
        """
        Reentrena si hay al menos N feedback nuevos desde el último retraining.
        """
        feedback_count = len(load_feedback_dataset())
        return (feedback_count - self.last_retrain_feedback_count) >= threshold

    def get_criticality(self, text: str):
        """
        Clasificación heurística por criticidad.
        """
        t = text.lower()

        n3_keywords = [
            "urgente", "caído", "caida", "crítico", "critico", "producción", "produccion",
            "bloqueado", "detenido", "severo", "masivo", "apagado", "sin servicio",
            "inaccesible", "brecha", "hack", "virus", "malware", "ransomware"
        ]

        n2_keywords = [
            "lento", "intermitente", "falla", "error", "reinicio", "problema",
            "timeout", "no responde", "latencia", "degradado"
        ]

        score = 0

        for kw in n3_keywords:
            if kw in t:
                score += 3

        for kw in n2_keywords:
            if kw in t:
                score += 1

        if score >= 4:
            return "Nivel 3 (Crítico)"
        elif score >= 2:
            return "Nivel 2 (Especializado)"
        else:
            return "Nivel 1 (Triaje Directo)"