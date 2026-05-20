import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_predict
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, f1_score

from core.constants import DEPARTMENTS


def compute_global_tfidf(vectorizer, X_matrix, top_n=10):
    """
    Calcula top términos TF-IDF globales (promedio sobre todos los documentos).
    """
    feature_names = vectorizer.get_feature_names_out()
    avg_scores = np.asarray(X_matrix.mean(axis=0)).ravel()

    top_indices = avg_scores.argsort()[-top_n:][::-1]

    results = []
    for i in top_indices:
        if avg_scores[i] > 0:
            results.append({
                "token": feature_names[i],
                "weight": round(float(avg_scores[i]), 6)
            })

    return results


def train_best_model(texts, labels):
    """
    Entrena modelos candidatos con CV real y devuelve el mejor.
    - Devuelve métricas basadas en CV real.
    - Matriz de confusión calculada con cross_val_predict.
    """

    vectorizer = TfidfVectorizer(max_features=12000, ngram_range=(1, 2))
    X = vectorizer.fit_transform(texts)

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # --- Modelo 1: MultinomialNB ---
    nb = MultinomialNB()
    nb_params = {"alpha": [0.001, 0.01, 0.1, 0.5, 1.0]}
    nb_grid = GridSearchCV(nb, nb_params, cv=cv, scoring="f1_weighted", n_jobs=-1)
    nb_grid.fit(X, labels)

    # --- Modelo 2: LogisticRegression ---
    lr = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)
    lr_params = {"C": [0.1, 0.5, 1.0, 2.0, 5.0]}
    lr_grid = GridSearchCV(lr, lr_params, cv=cv, scoring="f1_weighted", n_jobs=-1)
    lr_grid.fit(X, labels)

    # --- Modelo 3: SGDClassifier (Online Logistic Regression) ---
    sgd = SGDClassifier(loss="log_loss", random_state=42)
    sgd_params = {
        "alpha": [0.0001, 0.0005, 0.001],
        "penalty": ["l2", "l1"]
    }
    sgd_grid = GridSearchCV(sgd, sgd_params, cv=cv, scoring="f1_weighted", n_jobs=-1)
    sgd_grid.fit(X, labels)

    candidates = [
        ("Multinomial NB", nb_grid.best_estimator_, nb_grid.best_score_, nb_grid.best_params_),
        ("Regresión Logística", lr_grid.best_estimator_, lr_grid.best_score_, lr_grid.best_params_),
        ("SGDClassifier (Online)", sgd_grid.best_estimator_, sgd_grid.best_score_, sgd_grid.best_params_)
    ]

    candidates.sort(key=lambda x: x[2], reverse=True)
    best_name, best_model, best_f1, best_params = candidates[0]

    # --- Predicciones CV reales para matriz confusión ---
    y_pred_cv = cross_val_predict(best_model, X, labels, cv=cv, n_jobs=-1)

    cm = confusion_matrix(labels, y_pred_cv, labels=DEPARTMENTS)
    acc = accuracy_score(labels, y_pred_cv)
    f1_real = f1_score(labels, y_pred_cv, average="weighted")

    # Entrenar modelo final con TODO el dataset
    best_model.fit(X, labels)

    return {
        "vectorizer": vectorizer,
        "model": best_model,
        "model_name": best_name,
        "best_params": best_params,
        "f1_cv": float(best_f1),
        "f1_real": float(f1_real),
        "accuracy": float(acc),
        "confusion_matrix": cm.tolist(),
        "candidates": [
            {"name": c[0], "f1": float(c[2]), "params": c[3]}
            for c in candidates
        ]
    }