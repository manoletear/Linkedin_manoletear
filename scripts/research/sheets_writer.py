"""
Google Sheets Writer: escribe noticias puntuadas en el Google Sheet.
"""

import logging
from datetime import datetime

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from config import (
    GOOGLE_SHEETS_CREDENTIALS_FILE,
    GOOGLE_SHEETS_TOKEN_FILE,
    SPREADSHEET_ID,
    SHEET_NAME,
)

logger = logging.getLogger("research.sheets")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _get_sheets_service():
    """Autentica y devuelve el servicio de Google Sheets."""
    import os

    creds = None
    if os.path.exists(GOOGLE_SHEETS_TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(GOOGLE_SHEETS_TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_SHEETS_CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(GOOGLE_SHEETS_TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("sheets", "v4", credentials=creds)


def _generate_id(item: dict) -> str:
    """Genera ID único para una noticia: NEW-YYYYMMDD-fuente-hash."""
    import re
    import unicodedata

    date_str = item.get("fecha_iso", datetime.now().strftime("%Y-%m-%d")).replace("-", "")

    fuente_slug = (item.get("fuente_nombre") or item.get("fuente") or "unknown")
    fuente_slug = fuente_slug.lower()
    fuente_slug = unicodedata.normalize("NFD", fuente_slug)
    fuente_slug = re.sub(r"[\u0300-\u036f]", "", fuente_slug)
    fuente_slug = re.sub(r"[^a-z0-9]", "", fuente_slug)[:8]

    import time
    timestamp = format(int(time.time() * 1000), "X")[:6]

    return f"NEW-{date_str}-{fuente_slug}-{timestamp}"


def write_to_sheets(items: list[dict]) -> int:
    """
    Escribe noticias puntuadas al Google Sheet.
    Retorna la cantidad de filas escritas.
    """
    if not items:
        logger.info("Sin noticias para escribir en Sheets")
        return 0

    service = _get_sheets_service()

    rows = []
    for item in items:
        news_id = _generate_id(item)
        rows.append([
            news_id,
            item.get("fuente_nombre", item.get("fuente", "")),
            item.get("fuente", ""),
            item.get("titulo", ""),
            item.get("fecha_iso", ""),
            item.get("resumen", ""),
            item.get("score", 0),
            item.get("score_razon", ""),
            item.get("rubro", ""),
            item.get("tipo_fuente", ""),
            item.get("url_original", ""),
            item.get("email_id_gmail", ""),
        ])

    body = {"values": rows}

    result = (
        service.spreadsheets()
        .values()
        .append(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{SHEET_NAME}!A:L",
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=body,
        )
        .execute()
    )

    updates = result.get("updates", {})
    written = updates.get("updatedRows", len(rows))
    logger.info(f"Sheets: {written} filas escritas en '{SHEET_NAME}'")
    return written


def get_gmail_service():
    """Autentica y devuelve el servicio de Gmail (reutiliza tokens de Sheets)."""
    import os

    gmail_scopes = ["https://www.googleapis.com/auth/gmail.readonly"]
    all_scopes = SCOPES + gmail_scopes

    creds = None
    if os.path.exists(GOOGLE_SHEETS_TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(GOOGLE_SHEETS_TOKEN_FILE, all_scopes)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(GOOGLE_SHEETS_CREDENTIALS_FILE, all_scopes)
            creds = flow.run_local_server(port=0)

        with open(GOOGLE_SHEETS_TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)
