"""
Collectors: módulos que recopilan noticias de cada fuente.
Cada collector devuelve una lista de dicts con formato normalizado:
{
    "titulo": str,
    "cuerpo": str,
    "fuente": str,
    "fuente_nombre": str,
    "fecha_iso": str,
    "url_original": str,
    "tipo_fuente": str,  # "newsletter" | "rss" | "api"
    "email_id_gmail": str
}
"""

import re
import logging
from datetime import datetime

import requests
import feedparser

from config import (
    NEWSAPI_KEY,
    NEWSAPI_QUERIES,
    NEWSAPI_PAGE_SIZE,
    RSS_FEEDS,
    GMAIL_LABEL,
    GMAIL_MAX_RESULTS,
)

logger = logging.getLogger("research.collectors")


def _safe_date(raw_date: str) -> str:
    """Intenta parsear una fecha a ISO. Fallback a hoy."""
    if not raw_date:
        return datetime.now().strftime("%Y-%m-%d")
    try:
        return datetime.fromisoformat(raw_date.replace("Z", "+00:00")).strftime("%Y-%m-%d")
    except Exception:
        pass
    # Intentar formato RSS (RFC 2822)
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(raw_date).strftime("%Y-%m-%d")
    except Exception:
        return datetime.now().strftime("%Y-%m-%d")


def _strip_html(html: str) -> str:
    """Elimina tags HTML y normaliza espacios."""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:8000]


# ─── Gmail Collector ───────────────────────────────────────────────────────────

def collect_gmail(service) -> list[dict]:
    """
    Recopila emails con etiqueta Newsletter usando la API de Gmail.
    Requiere un objeto `service` autenticado de googleapiclient.
    """
    results = []

    try:
        # Obtener IDs de label
        labels_response = service.users().labels().list(userId="me").execute()
        label_id = None
        for label in labels_response.get("labels", []):
            if label["name"] == GMAIL_LABEL:
                label_id = label["id"]
                break

        if not label_id:
            logger.warning(f"Label '{GMAIL_LABEL}' no encontrada en Gmail")
            return []

        # Buscar mensajes con esa etiqueta (no leídos)
        messages_response = (
            service.users()
            .messages()
            .list(
                userId="me",
                labelIds=[label_id],
                q="is:unread",
                maxResults=GMAIL_MAX_RESULTS,
            )
            .execute()
        )

        messages = messages_response.get("messages", [])
        logger.info(f"Gmail: {len(messages)} emails no leídos con label '{GMAIL_LABEL}'")

        for msg_meta in messages:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_meta["id"], format="full")
                .execute()
            )

            headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}
            subject = headers.get("subject", "(sin asunto)")
            from_header = headers.get("from", "")
            date_header = headers.get("date", "")

            # Extraer nombre y email del from
            from_match = re.match(r"(.+?)\s*<(.+?)>", from_header)
            if from_match:
                fuente_nombre = from_match.group(1).strip().strip('"')
                fuente = from_match.group(2)
            else:
                fuente = from_header
                fuente_nombre = from_header

            # Extraer body (texto plano)
            body = _extract_body(msg.get("payload", {}))

            results.append({
                "titulo": subject,
                "cuerpo": body[:8000],
                "fuente": fuente,
                "fuente_nombre": fuente_nombre,
                "fecha_iso": _safe_date(date_header),
                "url_original": "",
                "tipo_fuente": "newsletter",
                "email_id_gmail": msg_meta["id"],
            })

    except Exception as e:
        logger.error(f"Error recopilando Gmail: {e}")

    return results


def _extract_body(payload: dict) -> str:
    """Extrae el body de texto plano de un mensaje Gmail."""
    import base64

    if payload.get("mimeType") == "text/plain" and payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")

    for part in payload.get("parts", []):
        result = _extract_body(part)
        if result:
            return result

    # Fallback: snippet
    return payload.get("snippet", "")


# ─── RSS Collector ─────────────────────────────────────────────────────────────

def collect_rss() -> list[dict]:
    """Recopila noticias de los feeds RSS configurados."""
    results = []

    for feed_config in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_config["url"])

            if feed.bozo and not feed.entries:
                logger.warning(f"RSS error en {feed_config['nombre']}: {feed.bozo_exception}")
                continue

            logger.info(f"RSS {feed_config['nombre']}: {len(feed.entries)} entradas")

            for entry in feed.entries[:10]:  # Máximo 10 por feed
                cuerpo = ""
                if hasattr(entry, "content") and entry.content:
                    cuerpo = _strip_html(entry.content[0].get("value", ""))
                elif hasattr(entry, "summary"):
                    cuerpo = _strip_html(entry.summary)
                elif hasattr(entry, "description"):
                    cuerpo = _strip_html(entry.description)

                fecha = ""
                if hasattr(entry, "published"):
                    fecha = entry.published
                elif hasattr(entry, "updated"):
                    fecha = entry.updated

                results.append({
                    "titulo": getattr(entry, "title", "(sin título)"),
                    "cuerpo": cuerpo,
                    "fuente": feed_config["nombre"],
                    "fuente_nombre": feed_config["nombre"],
                    "fecha_iso": _safe_date(fecha),
                    "url_original": getattr(entry, "link", ""),
                    "tipo_fuente": "rss",
                    "email_id_gmail": "",
                })

        except Exception as e:
            logger.error(f"Error en RSS {feed_config['nombre']}: {e}")

    return results


# ─── NewsAPI Collector ─────────────────────────────────────────────────────────

def collect_newsapi() -> list[dict]:
    """Recopila noticias de NewsAPI.org."""
    if not NEWSAPI_KEY:
        logger.warning("NEWSAPI_KEY no configurada, saltando NewsAPI")
        return []

    results = []

    for query_config in NEWSAPI_QUERIES:
        try:
            response = requests.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query_config["query"],
                    "language": query_config["language"],
                    "sortBy": "publishedAt",
                    "pageSize": NEWSAPI_PAGE_SIZE,
                    "apiKey": NEWSAPI_KEY,
                },
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()

            articles = data.get("articles", [])
            logger.info(f"NewsAPI '{query_config['query']}': {len(articles)} resultados")

            for article in articles:
                if not article.get("title") or article["title"] == "[Removed]":
                    continue

                cuerpo = (article.get("description") or "") + "\n\n" + (article.get("content") or "")

                results.append({
                    "titulo": article["title"],
                    "cuerpo": cuerpo.strip(),
                    "fuente": article.get("source", {}).get("name", "NewsAPI"),
                    "fuente_nombre": article.get("source", {}).get("name", "Desconocido"),
                    "fecha_iso": _safe_date(article.get("publishedAt", "")),
                    "url_original": article.get("url", ""),
                    "tipo_fuente": "api",
                    "email_id_gmail": "",
                })

        except Exception as e:
            logger.error(f"Error en NewsAPI '{query_config['query']}': {e}")

    return results
