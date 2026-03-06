"""
TooxsLkdn - Agente autónomo de automatización de posts para LinkedIn.

Genera y publica posts de forma automática según un schedule configurable.
"""

import json
import logging
import os
import signal
import sys
import time
from datetime import datetime
from pathlib import Path

import schedule
from dotenv import load_dotenv

from src.linkedin_client import LinkedInClient
from src.post_generator import PostGenerator

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(message)s"
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
logger = logging.getLogger("TooxsLkdn")

TOPICS_FILE = Path("config/topics.json")
HISTORY_FILE = Path("config/post_history.json")


class TooxsLkdn:
    """Agente autónomo que genera y publica posts en LinkedIn."""

    def __init__(self):
        load_dotenv()
        self._validate_env()

        self.generator = PostGenerator(api_key=os.environ["ANTHROPIC_API_KEY"])
        self.linkedin = LinkedInClient(access_token=os.environ["LINKEDIN_ACCESS_TOKEN"])
        self.language = os.getenv("POST_LANGUAGE", "es")
        self.tone = os.getenv("POST_TONE", "profesional")
        self.dry_run = os.getenv("DRY_RUN", "false").lower() == "true"

        self.topics = self._load_topics()
        self.history = self._load_history()
        self._topic_index = len(self.history) % len(self.topics) if self.topics else 0
        self._running = True

    def _validate_env(self):
        missing = []
        for key in ("ANTHROPIC_API_KEY", "LINKEDIN_ACCESS_TOKEN"):
            if not os.getenv(key):
                missing.append(key)
        if missing:
            logger.error("Variables faltantes: %s", ", ".join(missing))
            logger.error("Copia .env.example a .env y configura tus credenciales.")
            sys.exit(1)

    def _load_topics(self) -> list[str]:
        if not TOPICS_FILE.exists():
            logger.warning("No se encontró %s, usando temas por defecto.", TOPICS_FILE)
            return [
                "tendencias de inteligencia artificial en el trabajo",
                "productividad y gestión del tiempo para profesionales",
                "liderazgo en equipos remotos",
                "habilidades más demandadas en tecnología",
                "networking efectivo en LinkedIn",
                "marca personal para profesionales tech",
                "innovación y transformación digital",
            ]
        with open(TOPICS_FILE) as f:
            data = json.load(f)
        return data.get("topics", [])

    def _load_history(self) -> list[dict]:
        if not HISTORY_FILE.exists():
            return []
        with open(HISTORY_FILE) as f:
            return json.load(f)

    def _save_history(self):
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(HISTORY_FILE, "w") as f:
            json.dump(self.history, f, indent=2, ensure_ascii=False)

    def _next_topic(self) -> str:
        topic = self.topics[self._topic_index]
        self._topic_index = (self._topic_index + 1) % len(self.topics)
        return topic

    def run_once(
        self,
        override_topic: str | None = None,
        override_text: str | None = None,
    ):
        """Genera y publica un solo post.

        Args:
            override_topic: Si se proporciona, usa este tema en vez de rotar.
            override_text: Si se proporciona, publica este texto directamente
                           (sin generar con PostGenerator). Usado por TooxsRedactor.
        """
        if override_text:
            post_text = override_text
            topic = "(redactado por TooxsRedactor)"
            logger.info("Usando texto de TooxsRedactor (%d caracteres)", len(post_text))
        else:
            topic = override_topic or self._next_topic()
            logger.info("Tema seleccionado: %s", topic)

            try:
                post_text = self.generator.generate(
                    topic=topic, language=self.language, tone=self.tone
                )
            except Exception:
                logger.exception("Error generando post")
                return

        logger.info("Post generado (%d caracteres):\n%s", len(post_text), post_text)

        if self.dry_run:
            logger.info("[DRY RUN] Post NO publicado.")
            status = "dry_run"
        else:
            try:
                result = self.linkedin.create_post(post_text)
                status = result["status"]
                logger.info("Post publicado exitosamente.")
            except Exception:
                logger.exception("Error publicando en LinkedIn")
                status = "error"

        entry = {
            "timestamp": datetime.now().isoformat(),
            "topic": topic,
            "post": post_text,
            "status": status,
        }
        self.history.append(entry)
        self._save_history()

    def start(self, cron_time: str = "09:00"):
        """Inicia el agente con schedule diario.

        Args:
            cron_time: Hora de publicación diaria en formato HH:MM.
        """
        if not self.topics:
            logger.error("No hay temas configurados. Abortando.")
            sys.exit(1)

        # Validar conexión
        if not self.dry_run and not self.linkedin.validate_token():
            logger.error("Token de LinkedIn inválido. Configura LINKEDIN_ACCESS_TOKEN.")
            sys.exit(1)

        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

        schedule.every().day.at(cron_time).do(self.run_once)
        logger.info("TooxsLkdn iniciado. Publicará diariamente a las %s", cron_time)
        logger.info("Temas cargados: %d | Historial: %d posts", len(self.topics), len(self.history))
        if self.dry_run:
            logger.info("Modo DRY RUN activado (no se publicará en LinkedIn).")

        while self._running:
            schedule.run_pending()
            time.sleep(30)

        logger.info("TooxsLkdn detenido.")

    def _handle_shutdown(self, signum, frame):
        logger.info("Señal de apagado recibida. Deteniendo...")
        self._running = False
