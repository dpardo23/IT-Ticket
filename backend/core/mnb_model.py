import joblib
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.metrics import confusion_matrix, accuracy_score, f1_score

DEPARTMENTS = [
    "Mesa de Servicios", 
    "Microinformática", 
    "SysAdmins", 
    "NetOps", 
    "SecOps / IAM", 
    "DevOps"
]

MODEL_DIR = "saved_models"
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "best_classifier.pkl")

class ITTicketClassifier:
    def __init__(self):
        self.vectorizer = None
        self.classifier = None
        self.best_model_name = "Multinomial NB"
        self.optimal_alpha = 0.1
        self.global_f1 = 0.0
        self.global_cm = [[0] * len(DEPARTMENTS) for _ in range(len(DEPARTMENTS))]
        self.load_models()

    def load_models(self):
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            self.vectorizer = joblib.load(VECTORIZER_PATH)
            model_data = joblib.load(MODEL_PATH)
            if isinstance(model_data, dict):
                self.classifier = model_data.get("model")
                self.best_model_name = model_data.get("name", "Multinomial NB")
                self.optimal_alpha = model_data.get("alpha", 0.1)
                self.global_f1 = model_data.get("f1_score", 0.0)
                self.global_cm = model_data.get("confusion_matrix", self.global_cm)
            else:
                self.classifier = model_data
            print("Modelos y pesos cargados exitosamente desde disco.")
        else:
            print("No se encontraron modelos previos. Requiere entrenamiento inicial (Batch).")

    def save_models(self):
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)
        joblib.dump(self.vectorizer, VECTORIZER_PATH)
        joblib.dump({
            "model": self.classifier,
            "name": self.best_model_name,
            "alpha": self.optimal_alpha,
            "f1_score": self.global_f1,
            "confusion_matrix": self.global_cm
        }, MODEL_PATH)

    def train_batch(self, texts, labels):
        valid_texts = []
        valid_labels = []
        for t, l in zip(texts, labels):
            if t and len(t.strip()) > 0:
                valid_texts.append(t)
                valid_labels.append(l)

        if not valid_texts:
            raise ValueError("Todos los textos procesados quedaron vacíos tras la limpieza léxica.")

        self.vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(valid_texts)
        
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        mnb = MultinomialNB()
        params = {'alpha': [0.001, 0.01, 0.1, 0.5, 1.0]}
        grid = GridSearchCV(mnb, params, cv=cv, scoring='f1_weighted', n_jobs=-1)
        grid.fit(X, valid_labels)
        
        best_mnb = grid.best_estimator_
        mnb_f1 = grid.best_score_
        opt_alpha = grid.best_params_['alpha']

        lr = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
        from sklearn.model_selection import cross_val_score
        lr_scores = cross_val_score(lr, X, valid_labels, cv=cv, scoring='f1_weighted', n_jobs=-1)
        lr_f1 = np.mean(lr_scores)
        
        if lr_f1 > mnb_f1:
            lr.fit(X, valid_labels)
            self.classifier = lr
            self.best_model_name = "Regresión Logística"
            self.optimal_alpha = opt_alpha 
            final_f1 = lr_f1
        else:
            self.classifier = best_mnb
            self.best_model_name = "Multinomial NB"
            self.optimal_alpha = opt_alpha
            final_f1 = mnb_f1

        preds = self.classifier.predict(X)
        acc = accuracy_score(valid_labels, preds)
        cm = confusion_matrix(valid_labels, preds, labels=DEPARTMENTS)
        
        self.global_f1 = round(final_f1 * 100, 2)
        self.global_cm = cm.tolist()
        
        self.save_models()
        return acc, final_f1, self.global_cm, self.optimal_alpha, self.best_model_name

    def predict(self, cleaned_text: str):
        X_vec = self.vectorizer.transform([cleaned_text])
        probas = self.classifier.predict_proba(X_vec)[0]
        
        results = []
        for class_name, prob in zip(self.classifier.classes_, probas):
            results.append({
                "name": class_name,
                "value": round(prob * 100, 2)
            })
            
        results.sort(key=lambda x: x["value"], reverse=True)
        winner = results[0]["name"]
        
        feature_names = self.vectorizer.get_feature_names_out()
        tfidf_scores = X_vec.toarray()[0]
        top_indices = tfidf_scores.argsort()[-5:][::-1]
        
        top_tfidf = [
            {"token": feature_names[i], "weight": round(tfidf_scores[i], 4)} 
            for i in top_indices if tfidf_scores[i] > 0
        ]

        return winner, results, top_tfidf

    def partial_fit(self, cleaned_text: str, correct_department: str):
        X_vec = self.vectorizer.transform([cleaned_text])
        if hasattr(self.classifier, "partial_fit"):
            self.classifier.partial_fit(X_vec, [correct_department], classes=DEPARTMENTS)
            self.save_models()

    def get_criticality(self, text: str):
        text_lower = text.lower()
        n3_keywords = ["urgente", "caíd", "fuego", "crític", "producción", "bloqueo", "detenido", "severo", "masivo", "ayuda"]
        n2_keywords = ["lento", "falla", "error", "intermiten", "reinici", "atasca", "problema"]
        if any(k in text_lower for k in n3_keywords):
            return "Nivel 3 (Crítico)"
        if any(k in text_lower for k in n2_keywords):
            return "Nivel 2 (Especializado)"
        return "Nivel 1 (Triaje Directo)"