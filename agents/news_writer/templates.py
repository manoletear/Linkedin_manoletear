"""
Plantillas de redacción para distintos formatos de salida.
Cada plantilla define la estructura y tono del artículo generado.
"""

# ── LinkedIn Post ────────────────────────────────────────────────────────

LINKEDIN_TEMPLATE = """{headline}

{hook}

{body}

{takeaway}

{cta}

{hashtags}"""

LINKEDIN_HOOKS = {
    "pregunta": "¿{question}",
    "dato": "{stat}",
    "contraste": "Mientras {old_way}... {new_way}.",
    "prediccion": "En los próximos 12 meses, {prediction}.",
}

LINKEDIN_CTAS = {
    "pregunta": "¿Cómo está abordando tu organización este cambio? Me encantaría conocer tu perspectiva.",
    "invitacion": "Si te interesa profundizar en este tema, sígueme para más análisis sobre IA empresarial.",
    "debate": "¿Estás de acuerdo o ves el panorama de forma diferente? Abramos el debate.",
}

# ── Blog Article ─────────────────────────────────────────────────────────

BLOG_TEMPLATE = """# {title}

*{subtitle}*

## El contexto

{introduction}

## Qué está pasando

{body}

## Por qué importa

{analysis}

## Conclusión

{conclusion}

---

**Fuentes:** {sources}
"""

# ── Newsletter Briefing ──────────────────────────────────────────────────

NEWSLETTER_TEMPLATE = """# Briefing IA Empresarial — {date}

{tldr}

---

{articles_section}

---

*Este briefing es generado automáticamente a partir de fuentes públicas
y curado con criterio editorial sobre IA empresarial.*
"""

NEWSLETTER_ITEM_TEMPLATE = """### {number}. {title}

{summary}

**Por qué importa:** {why_it_matters}

[Leer más]({url}) — *{source}*
"""
