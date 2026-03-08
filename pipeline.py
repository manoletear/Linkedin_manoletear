"""
Pipeline completo: Scraper → Writer

Ejecuta ambos agentes en secuencia:
1. Scrapea noticias de IA empresarial
2. Las transforma en contenido publicable

Uso:
    python pipeline.py                          # LinkedIn (default)
    python pipeline.py --format blog            # Blog
    python pipeline.py --format newsletter      # Newsletter
"""

import argparse

from agents.ai_news_scraper.scraper import AINewsScraper
from agents.news_writer.writer import NewsWriter


def main():
    parser = argparse.ArgumentParser(description="Pipeline: scraper → redactor")
    parser.add_argument(
        "--format", "-f",
        choices=["linkedin", "blog", "newsletter"],
        default="linkedin",
    )
    args = parser.parse_args()

    # Paso 1: Scraping
    scraper = AINewsScraper()
    articles = scraper.run()

    if not articles:
        print("El scraper no encontró artículos relevantes.")
        return

    # Paso 2: Redacción
    writer = NewsWriter(output_format=args.format)
    results = writer.run(articles)

    print(f"\nPipeline completado: {len(articles)} artículos → {len(results)} pieza(s) [{args.format}]")


if __name__ == "__main__":
    main()
