"""
Agente redactor de noticias sobre IA empresarial.

Toma los artículos recopilados por el scraper y los transforma en
contenido editorial publicable en LinkedIn, blog o newsletter.
"""

import json
import os
import logging
import textwrap
from datetime import datetime
from typing import Optional

from .config import (
    AUTHOR_VOICE,
    LANGUAGE,
    LENGTH,
    EDITORIAL_ANGLES,
    DEFAULT_FORMAT,
    LINKEDIN_CONFIG,
    BLOG_CONFIG,
    NEWSLETTER_CONFIG,
    OUTPUT_DIR,
)
from .templates import (
    LINKEDIN_TEMPLATE,
    LINKEDIN_CTAS,
    BLOG_TEMPLATE,
    NEWSLETTER_TEMPLATE,
    NEWSLETTER_ITEM_TEMPLATE,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class NewsWriter:
    """Transforma artículos scrapeados en contenido editorial."""

    def __init__(self, output_format: str = DEFAULT_FORMAT):
        self.format = output_format
        output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR)
        os.makedirs(output_path, exist_ok=True)
        self.output_path = output_path

    def run(self, articles: list[dict]) -> list[str]:
        """Pipeline principal: recibe artículos, devuelve textos redactados."""
        if not articles:
            logger.warning("No hay artículos para redactar.")
            return []

        logger.info(
            "Redactando %d artículo(s) en formato '%s'...",
            len(articles), self.format,
        )

        dispatch = {
            "linkedin": self._write_linkedin,
            "blog": self._write_blog,
            "newsletter": self._write_newsletter,
        }

        writer_fn = dispatch.get(self.format, self._write_linkedin)
        results = writer_fn(articles)
        self._save_results(results)
        return results

    # ── LinkedIn ─────────────────────────────────────────────────────────

    def _write_linkedin(self, articles: list[dict]) -> list[str]:
        posts = []
        for article in articles:
            post = self._compose_linkedin_post(article)
            if post:
                posts.append(post)
        logger.info("LinkedIn: %d posts generados.", len(posts))
        return posts

    def _compose_linkedin_post(self, article: dict) -> str:
        title = article.get("title", "")
        summary = article.get("summary", "")
        keywords = article.get("matched_keywords", [])
        source = article.get("source", "")
        url = article.get("url", "")

        headline = self._build_headline(title)
        hook = self._build_hook(title, summary, keywords)
        body = self._build_body(summary, keywords, url, source)
        takeaway = self._build_takeaway(keywords)
        cta = LINKEDIN_CTAS.get(LINKEDIN_CONFIG["cta_style"], LINKEDIN_CTAS["pregunta"])
        hashtags = " ".join(
            self._select_hashtags(keywords, LINKEDIN_CONFIG["hashtag_count"])
        )

        post = LINKEDIN_TEMPLATE.format(
            headline=headline,
            hook=hook,
            body=body,
            takeaway=takeaway,
            cta=cta,
            hashtags=hashtags,
        )

        # Respetar límite de caracteres de LinkedIn
        max_chars = LINKEDIN_CONFIG["max_chars"]
        if len(post) > max_chars:
            post = post[:max_chars - 3] + "..."

        return post

    def _build_headline(self, title: str) -> str:
        if len(title) > 80:
            title = title[:77] + "..."
        return title.upper() if AUTHOR_VOICE == "ejecutivo" else title

    def _build_hook(self, title: str, summary: str, keywords: list) -> str:
        enterprise_terms = [
            k for k in keywords
            if k.lower() in (
                "enterprise ai", "ia empresarial", "ai strategy",
                "estrategia ia", "frictionless", "sin fricción",
                "business architecture", "arquitectura empresarial",
            )
        ]

        if enterprise_terms:
            angle = "La integración estratégica de la IA en la empresa"
            return (
                f"{angle} sigue acelerando. "
                f"Esta noticia lo confirma y abre preguntas clave "
                f"para quienes lideran la transformación."
            )

        return (
            f"Un desarrollo relevante en el mundo de la IA que merece "
            f"atención desde la perspectiva empresarial."
        )

    def _build_body(
        self, summary: str, keywords: list, url: str, source: str,
    ) -> str:
        paragraphs = []

        # Contexto
        if summary:
            context = self._rewrite_summary(summary)
            paragraphs.append(context)

        # Análisis estratégico
        angle = self._pick_editorial_angle(keywords)
        paragraphs.append(angle)

        # Referencia a fuente
        paragraphs.append(
            f"Según {source}, esta tendencia está ganando tracción "
            f"en organizaciones que priorizan la adopción sin fricción."
        )

        return "\n\n".join(paragraphs)

    def _build_takeaway(self, keywords: list) -> str:
        if any(k in keywords for k in ["ai strategy", "estrategia ia", "ai adoption", "adopción ia"]):
            return (
                "La clave no está en la tecnología en sí, sino en cómo "
                "se integra en los procesos existentes sin generar fricción. "
                "Las organizaciones que entienden esto llevan ventaja."
            )
        if any(k in keywords for k in ["automation", "automatización"]):
            return (
                "La automatización inteligente no reemplaza equipos: "
                "los potencia. El reto está en diseñar la transición "
                "para que sea natural y progresiva."
            )
        return (
            "Lo que diferencia a las empresas que avanzan con IA "
            "es su capacidad de integrarla en su arquitectura "
            "organizacional de forma estratégica y sostenible."
        )

    def _rewrite_summary(self, summary: str) -> str:
        """Reescribe el resumen en tono editorial."""
        sentences = summary.split(". ")
        if len(sentences) > 3:
            sentences = sentences[:3]
        rewritten = ". ".join(sentences)
        if not rewritten.endswith("."):
            rewritten += "."
        return rewritten

    def _pick_editorial_angle(self, keywords: list) -> str:
        if any(k in keywords for k in ["frictionless", "sin fricción", "ai integration", "integración ia"]):
            return EDITORIAL_ANGLES[0]
        if any(k in keywords for k in ["business architecture", "arquitectura empresarial"]):
            return EDITORIAL_ANGLES[1]
        if any(k in keywords for k in ["ai deployment", "despliegue ia"]):
            return EDITORIAL_ANGLES[2]
        if any(k in keywords for k in ["ai strategy", "estrategia ia"]):
            return EDITORIAL_ANGLES[3]
        return EDITORIAL_ANGLES[4]

    def _select_hashtags(self, keywords: list, count: int) -> list[str]:
        dynamic = []
        kw_to_tag = {
            "machine learning": "#MachineLearning",
            "generative ai": "#IAGenerativa",
            "ia generativa": "#IAGenerativa",
            "llm": "#LLM",
            "automation": "#Automatizacion",
            "automatización": "#Automatizacion",
            "ai governance": "#GobernanzaIA",
            "gobernanza ia": "#GobernanzaIA",
            "ai roi": "#ROIIA",
        }
        for kw in keywords:
            tag = kw_to_tag.get(kw.lower())
            if tag and tag not in dynamic:
                dynamic.append(tag)

        base = list(LINKEDIN_CONFIG["default_hashtags"])
        all_tags = dynamic + [t for t in base if t not in dynamic]
        return all_tags[:count]

    # ── Blog ─────────────────────────────────────────────────────────────

    def _write_blog(self, articles: list[dict]) -> list[str]:
        posts = []
        for article in articles:
            post = self._compose_blog_post(article)
            if post:
                posts.append(post)
        logger.info("Blog: %d artículos generados.", len(posts))
        return posts

    def _compose_blog_post(self, article: dict) -> str:
        title = article.get("title", "")
        summary = article.get("summary", "")
        keywords = article.get("matched_keywords", [])
        source = article.get("source", "")
        url = article.get("url", "")

        subtitle = self._pick_editorial_angle(keywords)
        introduction = self._rewrite_summary(summary)
        body = self._build_body(summary, keywords, url, source)
        analysis = self._build_takeaway(keywords)
        conclusion = (
            "La pregunta ya no es si adoptar IA, sino cómo hacerlo "
            "de forma que potencie la estructura existente en lugar de disrumpirla. "
            "Las empresas que resuelvan esta ecuación liderarán su sector."
        )
        sources = f"[{source}]({url})"

        return BLOG_TEMPLATE.format(
            title=title,
            subtitle=subtitle,
            introduction=introduction,
            body=body,
            analysis=analysis,
            conclusion=conclusion,
            sources=sources,
        )

    # ── Newsletter ───────────────────────────────────────────────────────

    def _write_newsletter(self, articles: list[dict]) -> list[str]:
        max_items = NEWSLETTER_CONFIG["max_articles"]
        selected = articles[:max_items]

        items_text = []
        for i, article in enumerate(selected, 1):
            keywords = article.get("matched_keywords", [])
            item = NEWSLETTER_ITEM_TEMPLATE.format(
                number=i,
                title=article.get("title", ""),
                summary=self._rewrite_summary(article.get("summary", "")),
                why_it_matters=self._build_takeaway(keywords),
                url=article.get("url", ""),
                source=article.get("source", ""),
            )
            items_text.append(item)

        tldr = ""
        if NEWSLETTER_CONFIG["include_tldr"]:
            tldr = "**TL;DR:** " + "; ".join(
                a.get("title", "")[:60] for a in selected
            ) + "."

        newsletter = NEWSLETTER_TEMPLATE.format(
            date=datetime.now().strftime("%d/%m/%Y"),
            tldr=tldr,
            articles_section="\n".join(items_text),
        )

        logger.info("Newsletter: 1 briefing con %d artículos.", len(selected))
        return [newsletter]

    # ── Persistencia ─────────────────────────────────────────────────────

    def _save_results(self, results: list[str]):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        for i, text in enumerate(results):
            ext = "md" if self.format in ("blog", "newsletter") else "txt"
            filename = f"{self.format}_{timestamp}_{i+1}.{ext}"
            path = os.path.join(self.output_path, filename)
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)

        logger.info("Guardados %d archivo(s) en %s", len(results), self.output_path)


def load_scraper_output(path: Optional[str] = None) -> list[dict]:
    """Carga el JSON más reciente del scraper."""
    if path:
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    scraper_output = os.path.join(
        os.path.dirname(__file__), "..", "ai_news_scraper", "output",
    )
    if not os.path.isdir(scraper_output):
        return []

    json_files = sorted(
        [f for f in os.listdir(scraper_output) if f.endswith(".json")],
        reverse=True,
    )
    if not json_files:
        return []

    latest = os.path.join(scraper_output, json_files[0])
    logger.info("Cargando datos del scraper: %s", latest)
    with open(latest, encoding="utf-8") as f:
        return json.load(f)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Redactor de noticias IA empresarial")
    parser.add_argument(
        "--format", "-f",
        choices=["linkedin", "blog", "newsletter"],
        default=DEFAULT_FORMAT,
        help="Formato de salida (default: linkedin)",
    )
    parser.add_argument(
        "--input", "-i",
        default=None,
        help="Ruta a JSON de artículos (default: último output del scraper)",
    )
    args = parser.parse_args()

    articles = load_scraper_output(args.input)
    if not articles:
        print("No hay artículos para procesar. Ejecuta primero el scraper:")
        print("  python -m agents.ai_news_scraper")
        return

    writer = NewsWriter(output_format=args.format)
    results = writer.run(articles)

    print(f"\n{'='*60}")
    print(f" CONTENIDO GENERADO — {len(results)} pieza(s) [{args.format}]")
    print(f"{'='*60}\n")

    for i, text in enumerate(results, 1):
        print(f"─── Pieza {i} ───")
        print(text)
        print()


if __name__ == "__main__":
    main()
