"""
Agente redactor de noticias sobre IA empresarial.

Toma los artículos recopilados por el scraper y los transforma en
contenido editorial publicable en LinkedIn, blog o newsletter.

Soporta dos modos:
- use_ai=True:  Claude redacta contenido original (requiere ANTHROPIC_API_KEY)
- use_ai=False: Usa plantillas estáticas (sin dependencias externas)
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

# ── System prompts para Claude ────────────────────────────────────────────

SYSTEM_LINKEDIN = """Eres un redactor experto en contenido para LinkedIn sobre IA empresarial.
Tu voz es {voice}. Escribes en {lang}.

Reglas:
- Máximo {max_chars} caracteres
- Estructura: titular impactante → hook que enganche → cuerpo con análisis → takeaway → CTA → hashtags
- No uses emojis salvo que se indique
- Tono: profesional pero accesible, con insights estratégicos
- Enfócate en el impacto empresarial, no en lo técnico
- Incluye exactamente {hashtag_count} hashtags relevantes al final
- El CTA debe ser una {cta_style} que invite a la conversación"""

SYSTEM_BLOG = """Eres un redactor experto en artículos de blog sobre IA empresarial.
Tu voz es {voice}. Escribes en {lang}.

Reglas:
- Entre {min_words} y {max_words} palabras
- Estructura: título → subtítulo → contexto → análisis → por qué importa → conclusión → fuentes
- Tono analítico pero accesible para directivos y líderes de negocio
- Incluye datos concretos y perspectiva estratégica
- Cita la fuente original"""

SYSTEM_NEWSLETTER = """Eres un editor de newsletters sobre IA empresarial.
Tu voz es {voice}. Escribes en {lang}.

Reglas:
- Estilo: {style}
- Cada artículo: resumen de 2-3 frases + "Por qué importa" en 1-2 frases
- Incluye un TL;DR al inicio con lo más destacado
- Tono ejecutivo y directo, para lectores con poco tiempo"""


class NewsWriter:
    """Transforma artículos scrapeados en contenido editorial."""

    def __init__(self, output_format: str = DEFAULT_FORMAT, use_ai: bool = False):
        """
        Args:
            output_format: 'linkedin', 'blog' o 'newsletter'.
            use_ai: Si True, usa Claude para redactar. Si False, plantillas.
        """
        self.format = output_format
        self.use_ai = use_ai
        output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR)
        os.makedirs(output_path, exist_ok=True)
        self.output_path = output_path

    def run(self, articles: list[dict]) -> list[str]:
        """Pipeline principal: recibe artículos, devuelve textos redactados."""
        if not articles:
            logger.warning("No hay artículos para redactar.")
            return []

        mode = "Claude" if self.use_ai else "plantillas"
        logger.info(
            "Redactando %d artículo(s) en formato '%s' [%s]...",
            len(articles), self.format, mode,
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

    # ══════════════════════════════════════════════════════════════════════
    #  LINKEDIN
    # ══════════════════════════════════════════════════════════════════════

    def _write_linkedin(self, articles: list[dict]) -> list[str]:
        posts = []
        for article in articles:
            if self.use_ai:
                post = self._compose_linkedin_with_claude(article)
            else:
                post = self._compose_linkedin_post(article)
            if post:
                posts.append(post)
        logger.info("LinkedIn: %d posts generados.", len(posts))
        return posts

    def _compose_linkedin_with_claude(self, article: dict) -> str:
        """Usa Claude para redactar un post de LinkedIn original."""
        from ..claude_client import ask_claude

        system = SYSTEM_LINKEDIN.format(
            voice=AUTHOR_VOICE,
            lang="español" if LANGUAGE == "es" else "English",
            max_chars=LINKEDIN_CONFIG["max_chars"],
            hashtag_count=LINKEDIN_CONFIG["hashtag_count"],
            cta_style=LINKEDIN_CONFIG["cta_style"],
        )

        prompt = f"""Redacta un post de LinkedIn basado en esta noticia:

**Título:** {article.get('title', '')}
**Fuente:** {article.get('source', '')}
**Resumen:** {article.get('summary', '')}
**Keywords:** {', '.join(article.get('matched_keywords', []))}
**URL:** {article.get('url', '')}

Ángulos editoriales sugeridos:
{chr(10).join(f'- {a}' for a in EDITORIAL_ANGLES)}

Escribe SOLO el post, listo para copiar y pegar en LinkedIn. Sin instrucciones ni metadatos."""

        try:
            post = ask_claude(prompt, system=system, max_tokens=1500, temperature=0.8)
            # Respetar límite de caracteres
            max_chars = LINKEDIN_CONFIG["max_chars"]
            if len(post) > max_chars:
                post = post[:max_chars - 3] + "..."
            return post
        except Exception as e:
            logger.warning("Error con Claude en LinkedIn: %s. Usando plantilla.", e)
            return self._compose_linkedin_post(article)

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

        max_chars = LINKEDIN_CONFIG["max_chars"]
        if len(post) > max_chars:
            post = post[:max_chars - 3] + "..."

        return post

    # ══════════════════════════════════════════════════════════════════════
    #  BLOG
    # ══════════════════════════════════════════════════════════════════════

    def _write_blog(self, articles: list[dict]) -> list[str]:
        posts = []
        for article in articles:
            if self.use_ai:
                post = self._compose_blog_with_claude(article)
            else:
                post = self._compose_blog_post(article)
            if post:
                posts.append(post)
        logger.info("Blog: %d artículos generados.", len(posts))
        return posts

    def _compose_blog_with_claude(self, article: dict) -> str:
        """Usa Claude para redactar un artículo de blog."""
        from ..claude_client import ask_claude

        system = SYSTEM_BLOG.format(
            voice=AUTHOR_VOICE,
            lang="español" if LANGUAGE == "es" else "English",
            min_words=BLOG_CONFIG["min_words"],
            max_words=BLOG_CONFIG["max_words"],
        )

        prompt = f"""Redacta un artículo de blog basado en esta noticia:

**Título:** {article.get('title', '')}
**Fuente:** {article.get('source', '')}
**URL:** {article.get('url', '')}
**Resumen:** {article.get('summary', '')}
**Keywords:** {', '.join(article.get('matched_keywords', []))}

Usa formato Markdown. Incluye la fuente original al final.
Escribe SOLO el artículo, sin instrucciones ni metadatos."""

        try:
            return ask_claude(prompt, system=system, max_tokens=3000, temperature=0.7)
        except Exception as e:
            logger.warning("Error con Claude en Blog: %s. Usando plantilla.", e)
            return self._compose_blog_post(article)

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

    # ══════════════════════════════════════════════════════════════════════
    #  NEWSLETTER
    # ══════════════════════════════════════════════════════════════════════

    def _write_newsletter(self, articles: list[dict]) -> list[str]:
        max_items = NEWSLETTER_CONFIG["max_articles"]
        selected = articles[:max_items]

        if self.use_ai:
            return [self._compose_newsletter_with_claude(selected)]

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

    def _compose_newsletter_with_claude(self, articles: list[dict]) -> str:
        """Usa Claude para redactar un briefing de newsletter completo."""
        from ..claude_client import ask_claude

        system = SYSTEM_NEWSLETTER.format(
            voice=AUTHOR_VOICE,
            lang="español" if LANGUAGE == "es" else "English",
            style=NEWSLETTER_CONFIG["style"],
        )

        articles_data = json.dumps(
            [
                {
                    "title": a.get("title", ""),
                    "source": a.get("source", ""),
                    "url": a.get("url", ""),
                    "summary": a.get("summary", ""),
                    "keywords": a.get("matched_keywords", []),
                }
                for a in articles
            ],
            ensure_ascii=False,
        )

        today = datetime.now().strftime("%d/%m/%Y")
        prompt = f"""Redacta un briefing de newsletter con fecha {today} basado en estos artículos:

{articles_data}

Estructura:
1. Título: "Briefing IA Empresarial — {today}"
2. TL;DR con lo más destacado (2-3 frases)
3. Para cada artículo: resumen + "Por qué importa" + link a fuente
4. Cierre editorial

Usa formato Markdown. Escribe SOLO el newsletter."""

        try:
            newsletter = ask_claude(prompt, system=system, max_tokens=4000, temperature=0.7)
            logger.info("Newsletter: 1 briefing con %d artículos (Claude).", len(articles))
            return newsletter
        except Exception as e:
            logger.warning("Error con Claude en Newsletter: %s. Usando plantilla.", e)
            # Fallback a plantilla
            return self._write_newsletter.__wrapped__(self, articles)[0] if hasattr(self._write_newsletter, '__wrapped__') else ""

    # ══════════════════════════════════════════════════════════════════════
    #  HELPERS (plantillas estáticas — fallback)
    # ══════════════════════════════════════════════════════════════════════

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
            "Un desarrollo relevante en el mundo de la IA que merece "
            "atención desde la perspectiva empresarial."
        )

    def _build_body(
        self, summary: str, keywords: list, url: str, source: str,
    ) -> str:
        paragraphs = []

        if summary:
            context = self._rewrite_summary(summary)
            paragraphs.append(context)

        angle = self._pick_editorial_angle(keywords)
        paragraphs.append(angle)

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
    parser.add_argument(
        "--ai", action="store_true",
        help="Usar Claude para redactar (requiere ANTHROPIC_API_KEY)",
    )
    args = parser.parse_args()

    articles = load_scraper_output(args.input)
    if not articles:
        print("No hay artículos para procesar. Ejecuta primero el scraper:")
        print("  python -m agents.ai_news_scraper")
        return

    writer = NewsWriter(output_format=args.format, use_ai=args.ai)
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
