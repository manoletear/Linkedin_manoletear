"""
Agente Google Sheets: Lee y actualiza la planilla.
Simula los nodos "Google Sheets - Leer" y "Google Sheets - Actualizar" de n8n.
"""
import json
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

from config import (
    GOOGLE_CREDENTIALS_FILE,
    GOOGLE_SHEET_ID,
    GOOGLE_SHEET_GID,
    ENRICHMENT_COLUMNS,
    URL_COLUMN,
)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def _get_client() -> gspread.Client:
    creds = Credentials.from_service_account_file(GOOGLE_CREDENTIALS_FILE, scopes=SCOPES)
    return gspread.authorize(creds)


def _get_worksheet() -> gspread.Worksheet:
    client = _get_client()
    spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
    # Buscar por gid
    for ws in spreadsheet.worksheets():
        if str(ws.id) == GOOGLE_SHEET_GID:
            return ws
    # Fallback: primera hoja
    return spreadsheet.sheet1


def read_all_rows() -> list[dict]:
    """Lee todas las filas como lista de dicts con los headers de fila 1."""
    ws = _get_worksheet()
    return ws.get_all_records()


def get_pending_profiles(batch_size: int = 1) -> list[dict]:
    """
    Filtra perfiles que tienen URL pero les falta Industria, Pais o Poder de Desicion.
    Retorna hasta `batch_size` perfiles pendientes.
    """
    rows = read_all_rows()
    pending = []

    for i, row in enumerate(rows):
        url = str(row.get(URL_COLUMN, "")).strip()
        if not url or "linkedin.com" not in url:
            continue

        # Verificar si falta alguno de los campos a enriquecer
        missing = any(not str(row.get(col, "")).strip() for col in ENRICHMENT_COLUMNS)
        if missing:
            pending.append({
                "row_index": i + 2,  # +2 porque fila 1 es header, gspread es 1-indexed
                "url": url,
                "first_name": str(row.get("First Name", "")),
                "last_name": str(row.get("Last Name", "")),
                "company": str(row.get("Company", "")),
                "position": str(row.get("Position", "")),
            })

        if len(pending) >= batch_size:
            break

    return pending


def update_row(row_index: int, data: dict) -> None:
    """
    Actualiza las columnas de enriquecimiento en una fila específica.
    data debe tener las keys: Industria, Pais, Poder de Desicion
    """
    ws = _get_worksheet()
    headers = ws.row_values(1)

    for col_name in ENRICHMENT_COLUMNS:
        if col_name in data and data[col_name]:
            try:
                col_index = headers.index(col_name) + 1  # gspread es 1-indexed
                ws.update_cell(row_index, col_index, str(data[col_name]))
            except ValueError:
                print(f"  [WARN] Columna '{col_name}' no encontrada en los headers")


if __name__ == "__main__":
    # Test: listar pendientes
    pending = get_pending_profiles(batch_size=5)
    print(f"Perfiles pendientes: {len(pending)}")
    for p in pending:
        print(f"  Fila {p['row_index']}: {p['first_name']} {p['last_name']} - {p['url']}")
