"""
Cliente compartido de Claude API para todos los agentes.

Centraliza la configuración del SDK de Anthropic y expone helpers
reutilizables (llamadas con retry, streaming, etc.).

Requiere la variable de entorno ANTHROPIC_API_KEY.
"""

import os
import logging

import anthropic

logger = logging.getLogger(__name__)

# ── Modelo por defecto ────────────────────────────────────────────────────

DEFAULT_MODEL = "claude-sonnet-4-6"  # Balance coste/calidad para uso diario

# ── Cliente singleton ─────────────────────────────────────────────────────

_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    """Devuelve un cliente Anthropic reutilizable (singleton)."""
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "Falta ANTHROPIC_API_KEY. Configúrala antes de ejecutar:\n"
                "  export ANTHROPIC_API_KEY='sk-ant-...'"
            )
        _client = anthropic.Anthropic(api_key=api_key)
        logger.info("Cliente Anthropic inicializado.")
    return _client


def ask_claude(
    prompt: str,
    *,
    system: str = "",
    model: str = DEFAULT_MODEL,
    max_tokens: int = 2048,
    temperature: float = 0.7,
) -> str:
    """
    Envía un prompt a Claude y devuelve la respuesta como texto.

    Args:
        prompt: Mensaje del usuario.
        system: System prompt opcional.
        model: ID del modelo.
        max_tokens: Máximo de tokens de salida.
        temperature: Creatividad (0.0 = determinista, 1.0 = máxima).

    Returns:
        Texto de la respuesta de Claude.
    """
    client = get_client()

    kwargs = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system
    # Solo pasar temperature cuando no se usa thinking
    if temperature is not None:
        kwargs["temperature"] = temperature

    response = client.messages.create(**kwargs)

    text = response.content[0].text
    logger.debug(
        "Claude [%s] → %d tokens in / %d tokens out",
        model,
        response.usage.input_tokens,
        response.usage.output_tokens,
    )
    return text


def ask_claude_json(
    prompt: str,
    *,
    system: str = "",
    model: str = DEFAULT_MODEL,
    max_tokens: int = 2048,
) -> dict | list:
    """
    Envía un prompt y parsea la respuesta como JSON.

    El system prompt indica a Claude que responda SOLO en JSON válido.
    """
    import json

    full_system = (
        "Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones, "
        "sin bloques de código. Solo el JSON puro.\n\n"
    )
    if system:
        full_system += system

    text = ask_claude(
        prompt,
        system=full_system,
        model=model,
        max_tokens=max_tokens,
        temperature=0.3,  # Más determinista para JSON
    )

    # Limpiar posibles artefactos de formato
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    return json.loads(text)
