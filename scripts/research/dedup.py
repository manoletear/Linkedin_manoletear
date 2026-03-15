"""
Deduplicación de noticias por similitud de título (Jaccard).
"""

import re
import unicodedata
import logging

from config import SIMILARITY_THRESHOLD

logger = logging.getLogger("research.dedup")


def _normalize(text: str) -> str:
    """Normaliza texto para comparación: minúsculas, sin tildes, sin puntuación."""
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = re.sub(r"[\u0300-\u036f]", "", text)
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _jaccard(a: str, b: str) -> float:
    """Similitud Jaccard entre dos strings (basada en palabras)."""
    words_a = set(a.split())
    words_b = set(b.split())
    if not words_a and not words_b:
        return 1.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union) if union else 0.0


def deduplicate(news_items: list[dict]) -> list[dict]:
    """
    Elimina duplicados por similitud de título.
    Si hay duplicados, mantiene el de mayor prioridad (newsletter > rss > api).
    """
    priority = {"newsletter": 3, "rss": 2, "api": 1}
    seen: dict[str, int] = {}  # normalized_title -> index in unique
    unique: list[dict] = []

    for item in news_items:
        norm_title = _normalize(item["titulo"])
        is_duplicate = False

        for existing_title, existing_idx in seen.items():
            if _jaccard(norm_title, existing_title) > SIMILARITY_THRESHOLD:
                is_duplicate = True
                # Reemplazar si el nuevo tiene mayor prioridad
                existing_priority = priority.get(unique[existing_idx]["tipo_fuente"], 0)
                new_priority = priority.get(item["tipo_fuente"], 0)
                if new_priority > existing_priority:
                    unique[existing_idx] = item
                break

        if not is_duplicate:
            seen[norm_title] = len(unique)
            unique.append(item)

    removed = len(news_items) - len(unique)
    if removed > 0:
        logger.info(f"Dedup: {len(news_items)} → {len(unique)} ({removed} duplicados eliminados)")

    return unique
