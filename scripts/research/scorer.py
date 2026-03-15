"""
Scorer: envía noticias a Claude API para análisis y scoring.
"""

import json
import logging

import requests

from config import ANTHROPIC_API_KEY, CLAUDE_MODEL, CLAUDE_MAX_TOKENS, SYSTEM_PROMPT

logger = logging.getLogger("research.scorer")


def score_news(item: dict) -> dict:
    """
    Envía una noticia a Claude API y devuelve el análisis:
    {resumen, score, score_razon, rubro}
    """
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY no configurada")

    user_message = (
        f"Analiza esta noticia y devuelve ÚNICAMENTE un JSON válido (sin markdown, sin texto extra).\n\n"
        f"Título: {item['titulo']}\n"
        f"Fuente: {item['fuente_nombre']}\n"
        f"Fecha: {item['fecha_iso']}\n"
        f"Tipo: {item['tipo_fuente']}\n\n"
        f"Contenido:\n{item['cuerpo']}\n\n"
        f'Devuelve exactamente este JSON:\n'
        f'{{\n'
        f'  "resumen": "2-3 oraciones con la idea central",\n'
        f'  "score": 7,\n'
        f'  "score_razon": "1 oración justificando el puntaje",\n'
        f'  "rubro": "Categoría del rubro válido"\n'
        f'}}'
    )

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": CLAUDE_MODEL,
            "max_tokens": CLAUDE_MAX_TOKENS,
            "system": SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": user_message}],
        },
        timeout=30,
    )
    response.raise_for_status()

    raw_text = response.json()["content"][0]["text"]
    return _parse_response(raw_text)


def _parse_response(raw_text: str) -> dict:
    """Parsea la respuesta JSON de Claude, con fallbacks."""
    import re

    # Intento directo
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    # Extraer de bloque ```json ... ```
    match = re.search(r"```(?:json)?\n?([\s\S]*?)\n?```", raw_text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Buscar JSON por llaves
    match = re.search(r"\{[\s\S]*\}", raw_text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"No se pudo parsear respuesta de Claude: {raw_text[:200]}")


def score_batch(items: list[dict]) -> list[dict]:
    """
    Puntúa un lote de noticias. Devuelve items enriquecidos con scoring.
    Continúa si un item falla.
    """
    scored = []

    for item in items:
        try:
            analysis = score_news(item)
            item["resumen"] = analysis.get("resumen", "")
            item["score"] = int(analysis.get("score", 0))
            item["score_razon"] = analysis.get("score_razon", "")
            item["rubro"] = analysis.get("rubro", "")
            scored.append(item)

            emoji = "🔥" if item["score"] >= 8 else "📋" if item["score"] >= 5 else "📝"
            logger.info(f"{emoji} Score {item['score']}/10 | {item['rubro']} | {item['titulo'][:60]}")

        except Exception as e:
            logger.error(f"Error scoring '{item['titulo'][:50]}': {e}")
            # Incluir con score 0 para no perder la noticia
            item["resumen"] = ""
            item["score"] = 0
            item["score_razon"] = f"Error en scoring: {e}"
            item["rubro"] = "Error"
            scored.append(item)

    return scored
