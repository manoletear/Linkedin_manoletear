"""
TooxsRedactor - Agente de redacción con personalidad, generación de imagen y video.

Lee el perfil de personalidad de Manuel Aravena, redacta propuestas de post
para noticias del sector, genera imágenes con Stability AI y crea
storyboards para videos cortos.
"""

import json
import logging
import os
import time
from pathlib import Path

import anthropic
import requests

logger = logging.getLogger("TooxsRedactor")

DEFAULT_PERSONALITY_PATH = "config/Manuel Aravena.md"

REDACTOR_SYSTEM_PROMPT = """Eres TooxsRedactor, un agente de redacción profesional para LinkedIn.

Tu trabajo es escribir posts en la VOZ y ESTILO de Manuel Aravena, basándote en su perfil
de personalidad y en noticias reales del sector inmobiliario y de IA.

PERFIL DE PERSONALIDAD:
{personality}

REGLAS DE REDACCIÓN:
- Escribe EXACTAMENTE como lo haría Manuel según su perfil
- El post debe estar basado en la noticia proporcionada
- Abre con un gancho potente que capture atención en los primeros 2 segundos
- Incluye una reflexión personal sobre la noticia (en primera persona)
- Conecta la noticia con la experiencia práctica en el sector
- Cierra con una pregunta que invite al debate
- Máximo 3000 caracteres (límite de LinkedIn)
- Usa emojis con moderación (2-4 máximo)
- Incluye 3-5 hashtags relevantes al final
- Si la noticia menciona herramientas de IA, explica brevemente cómo se pueden usar en la industria
- Devuelve SOLO el texto del post, sin explicaciones."""

IMAGE_PROMPT_TEMPLATE = """Basándote en esta noticia y en el post de LinkedIn, genera un prompt
en inglés para crear una imagen profesional y atractiva que acompañe el post.

Noticia: {news_title}
Resumen: {news_summary}
Post: {post_text}

La imagen debe:
- Ser profesional y moderna, estilo corporate tech
- Relacionada con el sector inmobiliario y/o inteligencia artificial
- Visualmente impactante para LinkedIn feed
- NO incluir texto ni logos
- Estilo: fotografía editorial o ilustración digital profesional

Devuelve SOLO el prompt para la imagen, en inglés, máximo 200 palabras."""

VIDEO_STORYBOARD_PROMPT = """Basándote en esta noticia y post de LinkedIn, genera un storyboard
para un video corto de 15-30 segundos para LinkedIn/Reels.

Noticia: {news_title}
Resumen: {news_summary}
Post: {post_text}

Devuelve un JSON con esta estructura:
{{
    "title": "Título del video",
    "duration_seconds": 15,
    "scenes": [
        {{
            "scene_number": 1,
            "duration_seconds": 3,
            "visual_description": "Descripción de lo que se ve",
            "text_overlay": "Texto que aparece en pantalla",
            "image_prompt": "Prompt en inglés para generar esta escena como imagen"
        }}
    ],
    "music_mood": "Estilo de música sugerido",
    "voiceover_script": "Script de narración en español (opcional)"
}}

Genera 4-5 escenas. Devuelve SOLO el JSON, sin texto adicional ni markdown."""


class TooxsRedactor:
    """Redacta posts con personalidad, genera imágenes y storyboards de video."""

    STABILITY_TEXT_TO_IMAGE_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3"

    def __init__(
        self,
        anthropic_key: str,
        stability_key: str | None = None,
        personality_path: str | None = None,
    ):
        self.claude = anthropic.Anthropic(api_key=anthropic_key)
        self.stability_key = stability_key
        self.personality = self._load_personality(
            personality_path or DEFAULT_PERSONALITY_PATH
        )
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)

    def _load_personality(self, path: str) -> str:
        """Carga el archivo de personalidad de Manuel Aravena."""
        try:
            content = Path(path).read_text(encoding="utf-8")
            logger.info("Personalidad cargada desde: %s", path)
            return content
        except FileNotFoundError:
            logger.warning(
                "Archivo de personalidad no encontrado: %s. Usando personalidad por defecto.",
                path,
            )
            return "Profesional del sector inmobiliario apasionado por la IA y la innovación tecnológica."

    def redact_post(self, news: dict) -> str:
        """Redacta un post de LinkedIn basado en una noticia, con la voz de Manuel.

        Args:
            news: Dict con keys: title, summary, category, url, score, ai_tools_mentioned (optional).

        Returns:
            Texto del post listo para publicar.
        """
        tools_info = ""
        tools = news.get("ai_tools_mentioned", [])
        if tools:
            tools_info = f"\nHerramientas de IA mencionadas: {', '.join(tools)}"

        user_message = (
            f"Redacta un post de LinkedIn sobre esta noticia:\n\n"
            f"Título: {news.get('title', '')}\n"
            f"Categoría: {news.get('category', '')}\n"
            f"Resumen: {news.get('summary', '')}\n"
            f"URL: {news.get('url', '')}\n"
            f"Relevancia (1-10): {news.get('score', 'N/A')}"
            f"{tools_info}"
        )

        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=REDACTOR_SYSTEM_PROMPT.format(personality=self.personality),
            messages=[{"role": "user", "content": user_message}],
        )

        post_text = response.content[0].text
        logger.info("Post redactado (%d caracteres)", len(post_text))
        return post_text

    def generate_image_prompt(self, news: dict, post_text: str) -> str:
        """Genera un prompt optimizado para crear una imagen con IA."""
        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": IMAGE_PROMPT_TEMPLATE.format(
                    news_title=news.get("title", ""),
                    news_summary=news.get("summary", ""),
                    post_text=post_text,
                ),
            }],
        )
        return response.content[0].text.strip()

    def generate_image(self, prompt: str, filename: str = "post_image.png") -> str | None:
        """Genera una imagen con Stability AI.

        Args:
            prompt: Prompt descriptivo para la imagen.
            filename: Nombre del archivo de salida.

        Returns:
            Ruta al archivo generado, o None si no hay API key.
        """
        if not self.stability_key:
            logger.info("Sin STABILITY_API_KEY. Imagen no generada. Prompt guardado.")
            prompt_path = self.output_dir / f"{filename}.prompt.txt"
            prompt_path.write_text(prompt, encoding="utf-8")
            return str(prompt_path)

        try:
            response = requests.post(
                self.STABILITY_TEXT_TO_IMAGE_URL,
                headers={
                    "Authorization": f"Bearer {self.stability_key}",
                    "Accept": "image/*",
                },
                files={"none": ""},
                data={
                    "prompt": prompt,
                    "output_format": "png",
                    "aspect_ratio": "16:9",
                    "model": "sd3.5-large",
                },
                timeout=120,
            )
            response.raise_for_status()

            output_path = self.output_dir / filename
            output_path.write_bytes(response.content)
            logger.info("Imagen generada: %s", output_path)
            return str(output_path)
        except Exception:
            logger.exception("Error generando imagen con Stability AI")
            prompt_path = self.output_dir / f"{filename}.prompt.txt"
            prompt_path.write_text(prompt, encoding="utf-8")
            return str(prompt_path)

    def generate_video_storyboard(self, news: dict, post_text: str) -> dict:
        """Genera un storyboard para video corto con escenas e imágenes.

        Args:
            news: Noticia original.
            post_text: Post de LinkedIn ya redactado.

        Returns:
            Dict con storyboard completo (title, scenes, music_mood, etc.)
        """
        response = self.claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[{
                "role": "user",
                "content": VIDEO_STORYBOARD_PROMPT.format(
                    news_title=news.get("title", ""),
                    news_summary=news.get("summary", ""),
                    post_text=post_text,
                ),
            }],
        )

        try:
            storyboard = json.loads(response.content[0].text)
            logger.info(
                "Storyboard generado: %s (%d escenas)",
                storyboard.get("title", ""),
                len(storyboard.get("scenes", [])),
            )
            return storyboard
        except (json.JSONDecodeError, IndexError):
            logger.exception("Error parseando storyboard")
            return {"title": "", "scenes": [], "error": "parse_failed"}

    def generate_video_images(self, storyboard: dict) -> list[str]:
        """Genera las imágenes de cada escena del storyboard.

        Args:
            storyboard: Dict con scenes que contienen image_prompt.

        Returns:
            Lista de rutas a las imágenes generadas (o prompts guardados).
        """
        image_paths = []
        for scene in storyboard.get("scenes", []):
            scene_num = scene.get("scene_number", 0)
            prompt = scene.get("image_prompt", "")
            if not prompt:
                continue

            filename = f"video_scene_{scene_num:02d}.png"
            path = self.generate_image(prompt, filename=filename)
            if path:
                image_paths.append(path)

            # Rate limiting
            time.sleep(1)

        logger.info("Imágenes de video generadas: %d", len(image_paths))
        return image_paths

    def create_proposal(self, news: dict) -> dict:
        """Crea una propuesta completa: post + imagen + video storyboard.

        Args:
            news: Dict de noticia analizada por TooxsNews.

        Returns:
            Dict con toda la propuesta:
            {
                "post_text": str,
                "image_prompt": str,
                "image_path": str | None,
                "storyboard": dict,
                "video_image_paths": list[str],
                "news": dict
            }
        """
        logger.info("=== Creando propuesta para: %s ===", news.get("title", ""))

        # 1. Redactar post con personalidad
        post_text = self.redact_post(news)

        # 2. Generar imagen
        image_prompt = self.generate_image_prompt(news, post_text)
        image_path = self.generate_image(image_prompt, filename="post_image.png")

        # 3. Generar storyboard de video
        storyboard = self.generate_video_storyboard(news, post_text)

        # 4. Generar imágenes del video
        video_image_paths = self.generate_video_images(storyboard)

        # 5. Guardar propuesta completa
        proposal = {
            "post_text": post_text,
            "image_prompt": image_prompt,
            "image_path": image_path,
            "storyboard": storyboard,
            "video_image_paths": video_image_paths,
            "news": news,
        }

        proposal_path = self.output_dir / "proposal.json"
        proposal_path.write_text(
            json.dumps(proposal, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        logger.info("Propuesta guardada en: %s", proposal_path)

        return proposal
