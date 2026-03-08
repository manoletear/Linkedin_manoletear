"""
Configuración del agente scraper de noticias IA empresarial.
Fuentes RSS, keywords y parámetros de búsqueda.
"""

# Fuentes RSS de noticias sobre IA y tecnología empresarial
RSS_FEEDS = [
    # Generalistas IA
    "https://feeds.feedburner.com/venturebeat/SZYF",       # VentureBeat AI
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.technologyreview.com/feed/",               # MIT Technology Review
    "https://feeds.feedburner.com/TheHackersNews",          # The Hacker News
    "https://www.wired.com/feed/tag/ai/latest/rss",         # Wired AI
    # Enterprise / Business
    "https://hbr.org/topic/technology.rss",                 # Harvard Business Review
    "https://www.mckinsey.com/rss/insights.rss",            # McKinsey
    "https://sloanreview.mit.edu/feed/",                    # MIT Sloan
    "https://www.forbes.com/ai/feed/",                      # Forbes AI
    "https://feeds.feedburner.com/zdnet/technology",        # ZDNet
]

# Keywords de relevancia (español e inglés)
KEYWORDS_PRIMARY = [
    "artificial intelligence", "inteligencia artificial",
    "machine learning", "aprendizaje automático",
    "generative ai", "ia generativa",
    "large language model", "llm",
    "ai strategy", "estrategia ia",
    "ai transformation", "transformación digital",
]

KEYWORDS_ENTERPRISE = [
    "enterprise ai", "ia empresarial",
    "ai adoption", "adopción ia",
    "ai integration", "integración ia",
    "business architecture", "arquitectura empresarial",
    "frictionless", "sin fricción",
    "ai deployment", "despliegue ia",
    "ai governance", "gobernanza ia",
    "ai scalability", "escalabilidad",
    "organizational change", "cambio organizacional",
    "digital strategy", "estrategia digital",
    "ai roi", "retorno inversión ia",
    "ai workforce", "fuerza laboral ia",
    "automation", "automatización",
    "ai infrastructure", "infraestructura ia",
]

# Puntuación mínima de relevancia (0-100) para incluir una noticia
RELEVANCE_THRESHOLD = 30

# Máximo de noticias a retornar por ejecución
MAX_RESULTS = 25

# Antigüedad máxima de noticias (en días)
MAX_AGE_DAYS = 7

# Archivo de salida
OUTPUT_DIR = "output"
OUTPUT_FORMAT = "json"  # json | csv | markdown
