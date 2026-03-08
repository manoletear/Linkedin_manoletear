"""
Agente scraper de noticias sobre IA y su aplicación estratégica en empresas.

Escanea fuentes RSS y web en busca de noticias relevantes sobre:
- Inteligencia Artificial aplicada a la empresa
- Estrategias de adopción sin fricción
- Arquitectura e infraestructura empresarial para IA
"""

import json
import csv
import os
import re
import logging
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional
from urllib.parse import urlparse

import feedparser
import requests
from bs4 import BeautifulSoup

from .config import (
    RSS_FEEDS,
    KEYWORDS_PRIMARY,
    KEYWORDS_ENTERPRISE,
    RELEVANCE_THRESHOLD,
    MAX_RESULTS,
    MAX_AGE_DAYS,
    OUTPUT_DIR,
    OUTPUT_FORMAT,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; AINewsScraper/1.0; "
        "+https://github.com/manoletear/Linkedin_manoletear)"
    )
}
REQUEST_TIMEOUT = 15


@dataclass
class Article:
    title: str
    url: str
    source: str
    published: Optional[str] = None
    summary: str = ""
    relevance_score: int = 0
    matched_keywords: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


class AINewsScraper:
    """Agente principal de scraping de noticias IA empresarial."""

    def __init__(self):
        self.articles: list[Article] = []
        self.seen_urls: set[str] = set()
        output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR)
        os.makedirs(output_path, exist_ok=True)
        self.output_path = output_path

    def run(self) -> list[dict]:
        """Ejecuta el pipeline completo de scraping."""
        logger.info("Iniciando scraping de noticias IA empresarial...")

        self._scrape_rss_feeds()
        self._score_articles()
        self._filter_and_rank()

        results = [a.to_dict() for a in self.articles]
        self._save_results(results)

        logger.info("Scraping completado. %d noticias relevantes encontradas.", len(results))
        return results

    # ── RSS ──────────────────────────────────────────────────────────────

    def _scrape_rss_feeds(self):
        """Recorre todas las fuentes RSS configuradas."""
        for feed_url in RSS_FEEDS:
            try:
                self._process_feed(feed_url)
            except Exception as e:
                logger.warning("Error procesando feed %s: %s", feed_url, e)

    def _process_feed(self, feed_url: str):
        # Fetch con headers propios para evitar bloqueos
        try:
            resp = requests.get(feed_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            feed = feedparser.parse(resp.content)
        except requests.RequestException as e:
            logger.warning("HTTP error en %s: %s — intentando directo", feed_url, e)
            feed = feedparser.parse(feed_url)
        source = feed.feed.get("title", urlparse(feed_url).netloc)
        cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)

        for entry in feed.entries:
            url = entry.get("link", "")
            if not url or url in self.seen_urls:
                continue

            published = self._parse_date(entry)
            if published and published < cutoff:
                continue

            title = entry.get("title", "").strip()
            summary = self._clean_html(
                entry.get("summary", entry.get("description", ""))
            )

            article = Article(
                title=title,
                url=url,
                source=source,
                published=published.isoformat() if published else None,
                summary=summary[:500],
            )
            self.articles.append(article)
            self.seen_urls.add(url)

        logger.info("Feed procesado: %s (%d entradas)", source, len(feed.entries))

    # ── Scoring ──────────────────────────────────────────────────────────

    def _score_articles(self):
        """Calcula la puntuación de relevancia de cada artículo."""
        for article in self.articles:
            score = 0
            text = f"{article.title} {article.summary}".lower()
            matched = []

            for kw in KEYWORDS_PRIMARY:
                if kw.lower() in text:
                    score += 15
                    matched.append(kw)

            for kw in KEYWORDS_ENTERPRISE:
                if kw.lower() in text:
                    score += 10
                    matched.append(kw)

            # Bonus: si el título contiene keywords clave
            title_lower = article.title.lower()
            if any(k in title_lower for k in ["enterprise", "empresarial", "strategy", "estrategia"]):
                score += 20
            if any(k in title_lower for k in ["frictionless", "sin fricción", "seamless"]):
                score += 15

            article.relevance_score = min(score, 100)
            article.matched_keywords = matched

    def _filter_and_rank(self):
        """Filtra por umbral de relevancia y ordena por puntuación."""
        self.articles = [
            a for a in self.articles if a.relevance_score >= RELEVANCE_THRESHOLD
        ]
        self.articles.sort(key=lambda a: a.relevance_score, reverse=True)
        self.articles = self.articles[:MAX_RESULTS]

    # ── Output ───────────────────────────────────────────────────────────

    def _save_results(self, results: list[dict]):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        if OUTPUT_FORMAT == "json":
            path = os.path.join(self.output_path, f"ai_news_{timestamp}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

        elif OUTPUT_FORMAT == "csv":
            path = os.path.join(self.output_path, f"ai_news_{timestamp}.csv")
            if results:
                with open(path, "w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=results[0].keys())
                    writer.writeheader()
                    writer.writerows(results)

        elif OUTPUT_FORMAT == "markdown":
            path = os.path.join(self.output_path, f"ai_news_{timestamp}.md")
            with open(path, "w", encoding="utf-8") as f:
                f.write("# Noticias IA Empresarial\n\n")
                f.write(f"*Generado: {timestamp}*\n\n")
                for r in results:
                    f.write(f"## [{r['title']}]({r['url']})\n")
                    f.write(f"**Fuente:** {r['source']} | ")
                    f.write(f"**Relevancia:** {r['relevance_score']}/100\n\n")
                    f.write(f"{r['summary']}\n\n---\n\n")

        logger.info("Resultados guardados en: %s", path)

    # ── Helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _parse_date(entry) -> Optional[datetime]:
        for field_name in ("published_parsed", "updated_parsed"):
            parsed = entry.get(field_name)
            if parsed:
                from time import mktime
                return datetime.fromtimestamp(mktime(parsed), tz=timezone.utc)
        return None

    @staticmethod
    def _clean_html(text: str) -> str:
        if not text:
            return ""
        soup = BeautifulSoup(text, "html.parser")
        return re.sub(r"\s+", " ", soup.get_text()).strip()


def main():
    scraper = AINewsScraper()
    results = scraper.run()

    print(f"\n{'='*60}")
    print(f" NOTICIAS IA EMPRESARIAL — {len(results)} resultados")
    print(f"{'='*60}\n")

    for i, article in enumerate(results, 1):
        print(f"{i}. [{article['relevance_score']:3d}] {article['title']}")
        print(f"   Fuente: {article['source']}")
        print(f"   URL: {article['url']}")
        print(f"   Keywords: {', '.join(article['matched_keywords'][:5])}")
        print()


if __name__ == "__main__":
    main()
