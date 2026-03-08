"""
Pipeline completo: Scraper → Writer

Ejecuta ambos agentes en secuencia:
1. Scrapea noticias de IA empresarial
2. Las transforma en contenido publicable

Uso:
    python pipeline.py                          # LinkedIn (plantillas)
    python pipeline.py --format blog            # Blog (plantillas)
    python pipeline.py --ai                     # LinkedIn con Claude
    python pipeline.py --ai --format newsletter # Newsletter con Claude
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
    parser.add_argument(
        "--ai", action="store_true",
        help="Usar Claude para scoring y redacción (requiere ANTHROPIC_API_KEY)",
    )
    args = parser.parse_args()

    # Paso 1: Scraping
    scraper = AINewsScraper(use_ai=args.ai)
    articles = scraper.run()

    if not articles:
        print("El scraper no encontró artículos relevantes.")
        return

    # Paso 2: Redacción
    writer = NewsWriter(output_format=args.format, use_ai=args.ai)
    results = writer.run(articles)

    mode = "Claude" if args.ai else "plantillas"
    print(f"\nPipeline completado ({mode}): {len(articles)} artículos → {len(results)} pieza(s) [{args.format}]")


if __name__ == "__main__":
    main()
