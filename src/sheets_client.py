"""Cliente para Google Sheets usando la API de Google."""

import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


class SheetsClient:
    """Maneja la lectura y escritura en Google Sheets."""

    def __init__(self, credentials_path: str, spreadsheet_id: str):
        creds = Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        self.gc = gspread.authorize(creds)
        self.spreadsheet = self.gc.open_by_key(spreadsheet_id)

    def get_or_create_worksheet(self, title: str, headers: list[str]) -> gspread.Worksheet:
        """Obtiene una hoja existente o la crea con los headers indicados."""
        try:
            worksheet = self.spreadsheet.worksheet(title)
        except gspread.exceptions.WorksheetNotFound:
            worksheet = self.spreadsheet.add_worksheet(
                title=title, rows=1000, cols=len(headers)
            )
            worksheet.append_row(headers)
        return worksheet

    def append_row(self, worksheet_title: str, row: list, headers: list[str] | None = None):
        """Agrega una fila a la hoja indicada."""
        if headers:
            ws = self.get_or_create_worksheet(worksheet_title, headers)
        else:
            ws = self.spreadsheet.worksheet(worksheet_title)
        ws.append_row(row, value_input_option="USER_ENTERED")

    def append_rows(self, worksheet_title: str, rows: list[list], headers: list[str] | None = None):
        """Agrega múltiples filas a la hoja indicada."""
        if headers:
            ws = self.get_or_create_worksheet(worksheet_title, headers)
        else:
            ws = self.spreadsheet.worksheet(worksheet_title)
        ws.append_rows(rows, value_input_option="USER_ENTERED")

    def get_all_values(self, worksheet_title: str) -> list[list[str]]:
        """Obtiene todos los valores de una hoja."""
        ws = self.spreadsheet.worksheet(worksheet_title)
        return ws.get_all_values()

    def get_column_values(self, worksheet_title: str, col: int) -> list[str]:
        """Obtiene los valores de una columna específica (1-indexed)."""
        ws = self.spreadsheet.worksheet(worksheet_title)
        return ws.col_values(col)
