"""Generador de posts para LinkedIn usando Claude."""

import anthropic


SYSTEM_PROMPT = """Eres un experto en marketing de contenidos para LinkedIn.
Tu trabajo es crear posts profesionales y atractivos que generen engagement.

Reglas:
- Escribe en el idioma indicado por el usuario.
- Usa el tono indicado (profesional, casual, inspirador, etc.).
- Incluye emojis relevantes pero sin exceso.
- Estructura el post con saltos de línea para facilitar la lectura.
- Incluye un call-to-action al final cuando sea apropiado.
- Máximo 3000 caracteres (límite de LinkedIn).
- NO uses hashtags excesivos, máximo 3-5 relevantes al final.
- Devuelve SOLO el texto del post, sin explicaciones adicionales."""


class PostGenerator:
    """Genera posts para LinkedIn usando la API de Claude."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model

    def generate(
        self,
        topic: str,
        language: str = "es",
        tone: str = "profesional",
    ) -> str:
        """Genera un post para LinkedIn.

        Args:
            topic: Tema o idea principal del post.
            language: Idioma del post (es, en, etc.).
            tone: Tono del post (profesional, casual, inspirador).

        Returns:
            Texto del post generado.
        """
        user_message = (
            f"Genera un post de LinkedIn sobre: {topic}\n"
            f"Idioma: {language}\n"
            f"Tono: {tone}"
        )

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        return response.content[0].text

    def improve(self, draft: str, instructions: str = "") -> str:
        """Mejora un borrador de post existente.

        Args:
            draft: Borrador del post a mejorar.
            instructions: Instrucciones adicionales para la mejora.

        Returns:
            Post mejorado.
        """
        user_message = (
            f"Mejora el siguiente post de LinkedIn:\n\n{draft}"
        )
        if instructions:
            user_message += f"\n\nInstrucciones adicionales: {instructions}"

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        return response.content[0].text
