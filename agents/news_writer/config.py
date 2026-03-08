"""
Configuración del agente redactor de noticias.
Tono editorial, formatos de salida y plantillas.
"""

# ── Perfil editorial ─────────────────────────────────────────────────────

AUTHOR_VOICE = "profesional-cercano"  # profesional-cercano | ejecutivo | divulgativo

LANGUAGE = "es"  # es | en

# Longitud objetivo por sección (en palabras aprox.)
LENGTH = {
    "titular": 15,
    "subtitulo": 25,
    "introduccion": 80,
    "cuerpo": 250,
    "conclusion": 60,
    "cta": 30,
}

# ── Enfoque temático ─────────────────────────────────────────────────────

EDITORIAL_ANGLES = [
    "Cómo esta tecnología reduce fricción en la adopción empresarial",
    "Impacto estratégico en la arquitectura organizacional",
    "Caso de uso concreto: del laboratorio a producción",
    "Qué significa esto para los líderes de negocio",
    "Tendencia emergente y su proyección a 12 meses",
]

# ── Formato de salida ────────────────────────────────────────────────────

OUTPUT_FORMATS = ["linkedin", "blog", "newsletter"]
DEFAULT_FORMAT = "linkedin"

# ── LinkedIn específico ──────────────────────────────────────────────────

LINKEDIN_CONFIG = {
    "max_chars": 3000,
    "use_emojis": False,
    "hashtag_count": 5,
    "default_hashtags": [
        "#InteligenciaArtificial", "#TransformacionDigital",
        "#IAEmpresarial", "#Estrategia", "#Innovacion",
    ],
    "cta_style": "pregunta",  # pregunta | invitacion | debate
}

BLOG_CONFIG = {
    "min_words": 400,
    "max_words": 800,
    "include_sources": True,
}

NEWSLETTER_CONFIG = {
    "max_articles": 5,
    "style": "briefing",  # briefing | deep-dive
    "include_tldr": True,
}

# ── Directorio de salida ─────────────────────────────────────────────────

OUTPUT_DIR = "output"
