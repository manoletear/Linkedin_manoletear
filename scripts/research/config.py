"""
Configuración centralizada del agente Research News Collector.
Variables de entorno y constantes.
"""

import os

# === API Keys (desde variables de entorno) ===
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY", "")
GOOGLE_SHEETS_CREDENTIALS_FILE = os.environ.get(
    "GOOGLE_SHEETS_CREDENTIALS_FILE", "credentials.json"
)
GOOGLE_SHEETS_TOKEN_FILE = os.environ.get("GOOGLE_SHEETS_TOKEN_FILE", "token.json")

# === Google Sheets ===
SPREADSHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "REEMPLAZAR_CON_TU_GOOGLE_SHEET_ID")
SHEET_NAME = "Research"

# === Gmail ===
GMAIL_LABEL = "Newsletter"
GMAIL_MAX_RESULTS = 10

# === RSS Feeds ===
RSS_FEEDS = [
    {"url": "https://feeds.technologyreview.com/mit-technology-review-es/", "nombre": "MIT Tech Review ES"},
    {"url": "https://techcrunch.com/category/artificial-intelligence/feed/", "nombre": "TechCrunch AI"},
    {"url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "nombre": "The Verge AI"},
    {"url": "https://www.anthropic.com/feed.xml", "nombre": "Anthropic Blog"},
    {"url": "https://blog.google/technology/ai/rss/", "nombre": "Google AI Blog"},
    {"url": "https://www.reuters.com/technology/rss", "nombre": "Reuters Tech"},
]

# === NewsAPI ===
NEWSAPI_QUERIES = [
    {"query": "inteligencia artificial automatización industrial", "language": "es"},
    {"query": "AI agents enterprise automation", "language": "en"},
    {"query": "minería Chile inteligencia artificial", "language": "es"},
    {"query": "n8n automation workflows", "language": "en"},
    {"query": "ERP artificial intelligence manufacturing", "language": "en"},
]
NEWSAPI_PAGE_SIZE = 5

# === Claude API ===
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"
CLAUDE_MAX_TOKENS = 800

# === Scoring ===
SYSTEM_PROMPT = """Eres un agente de RESEARCH para Manuel Aravena.

Tu trabajo es analizar noticias y evaluar su relevancia. NO generas contenido para LinkedIn.

## Contexto de Manuel
Emprendedor chileno. Automatizaciones, agentes IA y sistemas ERP para clientes en minería, manufactura y negocios en Chile/LATAM. Stack: n8n, HubSpot, Claude API, Supabase, WordPress.

## Su audiencia
Gerentes de operaciones, dueños de empresa, profesionales tech en LATAM. Quieren IA pragmática con ROI real.

## Scoring (1-10)
Evalúa cada noticia según:
- Relevancia para clientes industriales (minería, manufactura, automatización, IA): peso 40%
- Valor informativo (datos concretos, novedad real, no hype): peso 30%
- Potencial de engagement (¿Manuel puede aportar un ángulo único?): peso 30%

## Rubros válidos
Usa una de estas categorías: IA Industrial, Automatización, Minería Tech, Agentes IA, ERP/Sistemas, Cloud/Infra, Regulación IA, Talento/Equipos, IA Generativa, Datos/Analytics, Otro

## Reglas
- Resumen SIEMPRE en español latino
- Solo hechos, no interpretar ni opinar
- Score honesto: si no es relevante, puntúa bajo
- 2-3 oraciones máximo para el resumen"""

# === Deduplicación ===
SIMILARITY_THRESHOLD = 0.8
DEDUP_DAYS_LOOKBACK = 7
