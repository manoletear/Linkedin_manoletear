"""
TooxsNews - Agente de investigación de noticias inmobiliarias y de IA en construcción.

Busca noticias diarias, las analiza con Claude, las puntúa por relevancia
y las registra en Google Sheets.
"""

import hashlib
import json
import logging
import os
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.parse import quote

import anthropic
import requests

logger = logging.getLogger("TooxsNews")

SEARCH_QUERIES = [
    "inteligencia artificial sector inmobiliario noticias",
    "IA construcción tecnología innovación",
    "proptech inteligencia artificial real estate",
    "AI real estate construction technology news",
    "automatización inteligencia artificial bienes raíces",
    "machine learning construcción edificación",
    # Herramientas y lenguajes de IA para la industria
    "herramientas IA para inmobiliarias mejores software",
    "AI tools real estate agents property management",
    "ChatGPT Claude copilot herramientas inmobiliario",
    "Python machine learning real estate prediction",
    # Claude / Anthropic en Real Estate
    "Claude Anthropic real estate aplicaciones",
    "Anthropic AI construction property technology",
    "Claude AI inmobiliario automatización agentes",
]

GOOGLE_NEWS_QUERIES = [
    "inteligencia artificial inmobiliario",
    "IA construcción tecnología",
    "proptech real estate AI",
    "artificial intelligence construction",
    "automatización bienes raíces",
    # Herramientas de IA para el sector
    "AI tools real estate property",
    "herramientas inteligencia artificial inmobiliarias",
    # Claude / Anthropic
    "Anthropic Claude real estate",
    "Claude AI property construction",
]

ANALYSIS_PROMPT = """Eres un analista experto en el sector inmobiliario, en herramientas de IA
y en la aplicación de inteligencia artificial (especialmente Claude de Anthropic) en
construcción y bienes raíces.

Analiza las siguientes noticias extraídas de búsquedas web y devuelve un JSON array con las
noticias más relevantes (máximo 15). Para cada noticia incluye:

- "title": Título de la noticia
- "category": Categoría (una de:
    "Inmobiliario" - noticias generales del sector,
    "IA en Construcción" - aplicación de IA en obra y edificación,
    "PropTech" - startups y tecnología inmobiliaria,
    "IA Empresarial" - avances generales de IA aplicados a negocio,
    "Innovación Inmobiliaria" - nuevos modelos y tendencias,
    "Herramientas IA" - software, APIs, lenguajes y plataformas de IA útiles para el sector (ej: ChatGPT, Claude, Copilot, Python, TensorFlow, etc.),
    "Claude & Anthropic" - noticias específicas sobre Claude, Anthropic y sus aplicaciones en real estate y construcción)
- "summary": Resumen de 2-3 oraciones en español
- "url": URL de la noticia (la original, no inventada)
- "ai_tools_mentioned": Lista de herramientas/plataformas de IA mencionadas (ej: ["Claude", "Python", "TensorFlow"]), vacía si no aplica
- "score": Puntuación de 1-10 según el interés que generaría en el sector inmobiliario y los avances de IA a nivel empresarial. Criterios:
  - 9-10: Noticia sobre Claude/Anthropic aplicado a real estate, o herramienta de IA disruptiva para el sector
  - 7-8: Nuevo producto/regulación, caso de uso concreto de IA en inmobiliario
  - 5-6: Noticia relevante, tendencia interesante, aplicación práctica de IA
  - 1-4: Noticia menor, poca relevancia directa al sector

IMPORTANTE:
- Solo incluye noticias reales con URLs reales que aparezcan en los resultados.
- Filtra duplicados y noticias irrelevantes.
- Prioriza noticias recientes (últimos 7 días).
- Prioriza noticias sobre herramientas de IA aplicables y sobre Claude/Anthropic en el sector.
- Devuelve SOLO el JSON array, sin texto adicional ni markdown.

Resultados de búsqueda:
{search_results}"""

TOPIC_PROMPT = """Basándote en estas noticias del sector inmobiliario, herramientas de IA y
aplicaciones de Claude/Anthropic en real estate, genera un tema concreto y atractivo para
un post de LinkedIn dirigido a profesionales del sector.

El tema debe:
- Ser específico y basado en una noticia real
- Generar engagement y debate
- Puede tomar uno de estos enfoques (elige el más atractivo según las noticias):
  a) Conectar IA con el sector inmobiliario/construcción
  b) Recomendar herramientas de IA concretas y cómo usarlas en la industria
  c) Mostrar cómo Claude/Anthropic puede aplicarse en real estate (valoraciones, análisis de mercado, generación de listings, atención al cliente, etc.)

Noticias (ordenadas por relevancia):
{news_summary}

Devuelve SOLO el tema como una frase, sin explicaciones."""


class TooxsNews:
    """Busca y analiza noticias del sector inmobiliario y IA en construcción."""

    SERPER_URL = "https://google.serper.dev/search"
    NEWSAPI_URL = "https://newsapi.org/v2/everything"
    GOOGLE_NEWS_RSS = "https://news.google.com/rss/search"

    def __init__(
        self,
        anthropic_key: str,
        serper_key: str | None = None,
        newsapi_key: str | None = None,
    ):
        self.claude = anthropic.Anthropic(api_key=anthropic_key)
        self.serper_key = serper_key
        self.newsapi_key = newsapi_key

    def search_google_news(self, query: str, lang: str = "es", country: str = "ES") -> list[dict]:
        """Busca noticias en Google News via RSS (gratis, sin API key)."""
        try:
            encoded_query = quote(query)
            url = f"{self.GOOGLE_NEWS_RSS}?q={encoded_query}&hl={lang}&gl={country}&ceid={country}:{lang}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            root = ET.fromstring(response.content)
            results = []
            for item in root.findall(".//item"):
                title = item.findtext("title", "")
                link = item.findtext("link", "")
                description = item.findtext("description", "")
                pub_date = item.findtext("pubDate", "")
                source_elem = item.find("source")
                source_name = source_elem.text if source_elem is not None else "Google News"

                results.append({
                    "title": title,
                    "url": link,
                    "snippet": description,
                    "date": pub_date,
                    "source": f"google_news:{source_name}",
                })
            logger.info("Google News [%s]: %d resultados", query, len(results))
            return results
        except Exception:
            logger.exception("Error buscando en Google News RSS: %s", query)
            return []

    def search_serper(self, query: str, num_results: int = 10) -> list[dict]:
        """Busca noticias con Serper (Google Search API)."""
        if not self.serper_key:
            return []
        try:
            response = requests.post(
                self.SERPER_URL,
                json={"q": query, "num": num_results, "gl": "es", "hl": "es"},
                headers={"X-API-KEY": self.serper_key, "Content-Type": "application/json"},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            results = []
            for item in data.get("organic", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "source": "serper",
                })
            for item in data.get("news", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "date": item.get("date", ""),
                    "source": "serper_news",
                })
            return results
        except Exception:
            logger.exception("Error buscando en Serper: %s", query)
            return []

    def search_newsapi(self, query: str, num_results: int = 10) -> list[dict]:
        """Busca noticias con NewsAPI."""
        if not self.newsapi_key:
            return []
        try:
            response = requests.get(
                self.NEWSAPI_URL,
                params={
                    "q": query,
                    "language": "es",
                    "sortBy": "publishedAt",
                    "pageSize": num_results,
                    "apiKey": self.newsapi_key,
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            results = []
            for item in data.get("articles", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "snippet": item.get("description", ""),
                    "date": item.get("publishedAt", ""),
                    "source": "newsapi",
                })
            return results
        except Exception:
            logger.exception("Error buscando en NewsAPI: %s", query)
            return []

    def search_all(self) -> list[dict]:
        """Ejecuta todas las búsquedas y consolida resultados."""
        all_results = []
        seen_urls = set()

        def _add_results(results: list[dict]):
            for result in results:
                url = result.get("url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_results.append(result)

        # Google News RSS (gratis, siempre disponible)
        for query in GOOGLE_NEWS_QUERIES:
            _add_results(self.search_google_news(query))

        # Serper + NewsAPI (requieren API keys)
        for query in SEARCH_QUERIES:
            _add_results(self.search_serper(query) + self.search_newsapi(query))

        logger.info("Total de resultados de búsqueda: %d", len(all_results))
        return all_results

    def analyze_news(self, raw_results: list[dict]) -> list[dict]:
        """Analiza los resultados con Claude y devuelve noticias procesadas."""
        if not raw_results:
            logger.warning("No hay resultados para analizar.")
            return []

        search_text = ""
        for r in raw_results[:50]:  # Limitar para no exceder contexto
            search_text += f"- [{r.get('title', 'Sin título')}]({r.get('url', '')})\n"
            search_text += f"  {r.get('snippet', '')}\n"
            if r.get("date"):
                search_text += f"  Fecha: {r['date']}\n"
            search_text += "\n"

        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": ANALYSIS_PROMPT.format(search_results=search_text),
            }],
        )

        try:
            news_list = json.loads(response.content[0].text)
            logger.info("Noticias analizadas: %d", len(news_list))
            return news_list
        except (json.JSONDecodeError, IndexError):
            logger.exception("Error parseando respuesta de Claude")
            return []

    def generate_topic_from_news(self, news: list[dict]) -> str:
        """Genera un tema para TooxsLkdn basado en las noticias del día."""
        if not news:
            return ""

        news_summary = "\n".join(
            f"- [{n['title']}] (Score: {n['score']}) {n['summary']}"
            for n in sorted(news, key=lambda x: x.get("score", 0), reverse=True)[:5]
        )

        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{
                "role": "user",
                "content": TOPIC_PROMPT.format(news_summary=news_summary),
            }],
        )

        return response.content[0].text.strip()

    @staticmethod
    def generate_news_id(title: str, url: str) -> str:
        """Genera un ID único para una noticia."""
        raw = f"{title}:{url}"
        return hashlib.sha256(raw.encode()).hexdigest()[:12]

    def format_for_sheets(self, news: list[dict]) -> list[list]:
        """Convierte noticias analizadas al formato de filas para Google Sheets."""
        today = datetime.now().strftime("%Y-%m-%d")
        rows = []
        for n in news:
            news_id = self.generate_news_id(n.get("title", ""), n.get("url", ""))
            ai_tools = ", ".join(n.get("ai_tools_mentioned", []))
            rows.append([
                news_id,
                n.get("category", "Sin categoría"),
                today,
                n.get("title", ""),
                n.get("summary", ""),
                n.get("url", ""),
                n.get("score", 0),
                ai_tools,
            ])
        return rows
