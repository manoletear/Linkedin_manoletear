"""
Orquestador que conecta el agente de noticias (NewsResearcher)
con el agente de publicación (TooxsLkdn).

Flujo diario:
1. NewsResearcher busca noticias del sector inmobiliario + IA
2. Analiza y puntúa las noticias con Claude
3. Registra cada noticia en Google Sheets
4. Genera un tema basado en las noticias top
5. TooxsLkdn genera y publica un post con ese tema
"""

import logging
import os
import signal
import sys
import time

import schedule
from dotenv import load_dotenv

from src.news_researcher import NewsResearcher
from src.sheets_client import SheetsClient
from src.tooxs_lkdn import TooxsLkdn

logger = logging.getLogger("TooxsLkdn.Orchestrator")

SHEETS_HEADERS = [
    "ID Noticia",
    "Rubro",
    "Fecha",
    "Título",
    "Resumen",
    "Link",
    "Score",
]
WORKSHEET_NAME = "Noticias_IA_Inmobiliario"


class Orchestrator:
    """Coordina la búsqueda de noticias y la publicación en LinkedIn."""

    def __init__(self):
        load_dotenv()
        self._validate_env()

        self.researcher = NewsResearcher(
            anthropic_key=os.environ["ANTHROPIC_API_KEY"],
            serper_key=os.getenv("SERPER_API_KEY"),
            newsapi_key=os.getenv("NEWSAPI_KEY"),
        )

        sheets_creds = os.getenv("GOOGLE_CREDENTIALS_PATH", "config/credentials.json")
        sheets_id = os.environ["GOOGLE_SPREADSHEET_ID"]
        self.sheets = SheetsClient(
            credentials_path=sheets_creds,
            spreadsheet_id=sheets_id,
        )

        self.publisher = TooxsLkdn()
        self._running = True

    def _validate_env(self):
        missing = []
        for key in ("ANTHROPIC_API_KEY", "LINKEDIN_ACCESS_TOKEN", "GOOGLE_SPREADSHEET_ID"):
            if not os.getenv(key):
                missing.append(key)
        if not os.getenv("SERPER_API_KEY") and not os.getenv("NEWSAPI_KEY"):
            missing.append("SERPER_API_KEY o NEWSAPI_KEY (al menos una)")
        if missing:
            logger.error("Variables faltantes: %s", ", ".join(missing))
            sys.exit(1)

    def _get_existing_ids(self) -> set[str]:
        """Obtiene IDs de noticias ya registradas para evitar duplicados."""
        try:
            ids = self.sheets.get_column_values(WORKSHEET_NAME, 1)
            return set(ids[1:])  # Skip header
        except Exception:
            return set()

    def run_daily_cycle(self):
        """Ejecuta el ciclo completo: buscar → analizar → registrar → publicar."""
        logger.info("=== Iniciando ciclo diario ===")

        # 1. Buscar noticias
        logger.info("Paso 1: Buscando noticias...")
        raw_results = self.researcher.search_all()
        if not raw_results:
            logger.warning("No se encontraron resultados de búsqueda.")
            logger.info("Publicando con tema genérico...")
            self.publisher.run_once()
            return

        # 2. Analizar con Claude
        logger.info("Paso 2: Analizando noticias con Claude...")
        analyzed_news = self.researcher.analyze_news(raw_results)
        if not analyzed_news:
            logger.warning("No se pudieron analizar las noticias.")
            self.publisher.run_once()
            return

        # 3. Registrar en Google Sheets (evitando duplicados)
        logger.info("Paso 3: Registrando en Google Sheets...")
        existing_ids = self._get_existing_ids()
        rows = self.researcher.format_for_sheets(analyzed_news)
        new_rows = [r for r in rows if r[0] not in existing_ids]

        if new_rows:
            try:
                self.sheets.append_rows(
                    WORKSHEET_NAME, new_rows, headers=SHEETS_HEADERS
                )
                logger.info("Registradas %d noticias nuevas en Sheets.", len(new_rows))
            except Exception:
                logger.exception("Error escribiendo en Google Sheets")
        else:
            logger.info("No hay noticias nuevas para registrar.")

        # 4. Generar tema basado en noticias top
        logger.info("Paso 4: Generando tema para post...")
        topic = self.researcher.generate_topic_from_news(analyzed_news)
        if topic:
            logger.info("Tema generado: %s", topic)
        else:
            logger.warning("No se pudo generar tema. Usando rotación normal.")

        # 5. Publicar en LinkedIn
        logger.info("Paso 5: Generando y publicando post...")
        self.publisher.run_once(override_topic=topic or None)

        logger.info("=== Ciclo diario completado ===")

    def start(self, research_time: str = "08:00", post_time: str = "09:00"):
        """Inicia el orquestador con schedule.

        Args:
            research_time: Hora para ejecutar el ciclo completo (buscar + publicar).
            post_time: No usado en modo orquestador (el ciclo incluye publicación).
        """
        if not self.publisher.dry_run and not self.publisher.linkedin.validate_token():
            logger.error("Token de LinkedIn inválido.")
            sys.exit(1)

        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

        schedule.every().day.at(research_time).do(self.run_daily_cycle)

        logger.info("Orquestador iniciado. Ciclo diario a las %s", research_time)
        if self.publisher.dry_run:
            logger.info("Modo DRY RUN activado.")

        while self._running:
            schedule.run_pending()
            time.sleep(30)

        logger.info("Orquestador detenido.")

    def _handle_shutdown(self, signum, frame):
        logger.info("Señal de apagado recibida. Deteniendo...")
        self._running = False
