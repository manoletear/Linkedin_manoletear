#!/usr/bin/env python3
"""
Research News Collector — Agente de investigación para Manuel Aravena.

Recopila noticias de Gmail (newsletters), RSS feeds y NewsAPI,
las deduplica, las puntúa con Claude API, y las escribe en Google Sheets.

Uso:
    python main.py                  # Ejecutar todas las fuentes
    python main.py --source gmail   # Solo Gmail
    python main.py --source rss     # Solo RSS
    python main.py --source newsapi # Solo NewsAPI
    python main.py --dry-run        # Recopilar y puntuar sin escribir en Sheets
"""

import argparse
import logging
import sys
from datetime import datetime

from collectors import collect_gmail, collect_rss, collect_newsapi
from dedup import deduplicate
from scorer import score_batch
from sheets_writer import write_to_sheets, get_gmail_service

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("research.main")


def run(sources: list[str] | None = None, dry_run: bool = False):
    """Ejecuta el pipeline completo de research."""
    start = datetime.now()
    logger.info(f"=== Research News Collector iniciado ({start.strftime('%Y-%m-%d %H:%M')}) ===")

    all_sources = sources or ["gmail", "rss", "newsapi"]
    all_news = []

    # 1. Recopilar de cada fuente
    if "gmail" in all_sources:
        logger.info("--- Recopilando de Gmail ---")
        try:
            gmail_service = get_gmail_service()
            gmail_news = collect_gmail(gmail_service)
            all_news.extend(gmail_news)
            logger.info(f"Gmail: {len(gmail_news)} noticias")
        except Exception as e:
            logger.error(f"Gmail falló: {e}")

    if "rss" in all_sources:
        logger.info("--- Recopilando de RSS ---")
        rss_news = collect_rss()
        all_news.extend(rss_news)
        logger.info(f"RSS: {len(rss_news)} noticias")

    if "newsapi" in all_sources:
        logger.info("--- Recopilando de NewsAPI ---")
        newsapi_news = collect_newsapi()
        all_news.extend(newsapi_news)
        logger.info(f"NewsAPI: {len(newsapi_news)} noticias")

    if not all_news:
        logger.warning("Sin noticias recopiladas. Terminando.")
        return

    logger.info(f"Total recopilado: {len(all_news)} noticias")

    # 2. Deduplicar
    logger.info("--- Deduplicando ---")
    unique_news = deduplicate(all_news)
    logger.info(f"Noticias únicas: {len(unique_news)}")

    # 3. Scoring con Claude
    logger.info("--- Scoring con Claude API ---")
    scored_news = score_batch(unique_news)

    # Resumen de scoring
    high = sum(1 for n in scored_news if n.get("score", 0) >= 8)
    medium = sum(1 for n in scored_news if 5 <= n.get("score", 0) < 8)
    low = sum(1 for n in scored_news if n.get("score", 0) < 5)
    logger.info(f"Scoring: {high} alta | {medium} media | {low} baja prioridad")

    # 4. Escribir en Google Sheets
    if dry_run:
        logger.info("--- DRY RUN: no se escribe en Sheets ---")
        for n in scored_news:
            print(f"  [{n.get('score', '?')}/10] {n.get('rubro', '?')} | {n['titulo'][:70]}")
    else:
        logger.info("--- Escribiendo en Google Sheets ---")
        written = write_to_sheets(scored_news)
        logger.info(f"Filas escritas: {written}")

    elapsed = (datetime.now() - start).total_seconds()
    logger.info(f"=== Completado en {elapsed:.1f}s ===")


def main():
    parser = argparse.ArgumentParser(description="Research News Collector - Manuel Aravena")
    parser.add_argument(
        "--source",
        choices=["gmail", "rss", "newsapi"],
        action="append",
        help="Fuente(s) a consultar. Se puede repetir. Default: todas.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Recopilar y puntuar sin escribir en Google Sheets.",
    )
    args = parser.parse_args()

    run(sources=args.source, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
