import spacy
import re

# Cargamos el modelo en español que instalaste
try:
    nlp = spacy.load("es_core_news_sm")
except OSError:
    print("Error: No se encontró el modelo de spaCy. Ejecuta: python -m spacy download es_core_news_sm")

def clean_text(text: str) -> str:
    """
    Limpia, tokeniza y lematiza el texto crudo.
    """
    if not text:
        return ""
        
    # 1. Limpieza básica (quitar números, símbolos, pasar a minúsculas)
    text = re.sub(r'[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]', ' ', text).lower()
    
    # 2. Procesamiento con spaCy
    doc = nlp(text)
    
    # 3. Lematización y filtro de stopwords
    clean_tokens = []
    for token in doc:
        if not token.is_stop and not token.is_punct and not token.is_space and len(token.text) > 2:
            clean_tokens.append(token.lemma_)
            
    return " ".join(clean_tokens)

def get_tokens_list(text: str) -> list:
    """Devuelve la lista de tokens para visualización en el frontend."""
    return clean_text(text).split()