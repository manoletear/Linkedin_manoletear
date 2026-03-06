"""Agente principal de automatización de LinkedIn."""

import argparse
import sys

from dotenv import load_dotenv
import os

from src.linkedin_client import LinkedInClient
from src.post_generator import PostGenerator


def get_env_or_exit(key: str) -> str:
    """Obtiene una variable de entorno o termina con error."""
    value = os.getenv(key)
    if not value:
        print(f"Error: Variable de entorno '{key}' no configurada.")
        print("Copia .env.example a .env y configura tus credenciales.")
        sys.exit(1)
    return value


def cmd_generate(args):
    """Genera un post sin publicarlo."""
    load_dotenv()
    api_key = get_env_or_exit("ANTHROPIC_API_KEY")
    language = os.getenv("POST_LANGUAGE", "es")
    tone = os.getenv("POST_TONE", "profesional")

    generator = PostGenerator(api_key=api_key)
    post = generator.generate(topic=args.topic, language=language, tone=tone)

    print("\n--- Post Generado ---\n")
    print(post)
    print("\n--- Fin ---\n")


def cmd_publish(args):
    """Genera y publica un post en LinkedIn."""
    load_dotenv()
    api_key = get_env_or_exit("ANTHROPIC_API_KEY")
    token = get_env_or_exit("LINKEDIN_ACCESS_TOKEN")
    language = os.getenv("POST_LANGUAGE", "es")
    tone = os.getenv("POST_TONE", "profesional")

    generator = PostGenerator(api_key=api_key)
    linkedin = LinkedInClient(access_token=token)

    # Validar token
    if not linkedin.validate_token():
        print("Error: Token de LinkedIn inválido o expirado.")
        sys.exit(1)

    # Generar post
    if args.text:
        post_text = args.text
    else:
        print(f"Generando post sobre: {args.topic}")
        post_text = generator.generate(
            topic=args.topic, language=language, tone=tone
        )

    print("\n--- Post a Publicar ---\n")
    print(post_text)
    print("\n---\n")

    if not args.yes:
        confirm = input("¿Publicar este post? (s/n): ").strip().lower()
        if confirm != "s":
            print("Publicación cancelada.")
            return

    result = linkedin.create_post(post_text)
    print(f"Post publicado exitosamente. Status: {result['status_code']}")


def cmd_improve(args):
    """Mejora un borrador de post."""
    load_dotenv()
    api_key = get_env_or_exit("ANTHROPIC_API_KEY")

    generator = PostGenerator(api_key=api_key)
    improved = generator.improve(
        draft=args.draft, instructions=args.instructions or ""
    )

    print("\n--- Post Mejorado ---\n")
    print(improved)
    print("\n--- Fin ---\n")


def cmd_validate(args):
    """Valida la conexión con LinkedIn."""
    load_dotenv()
    token = get_env_or_exit("LINKEDIN_ACCESS_TOKEN")
    linkedin = LinkedInClient(access_token=token)

    if linkedin.validate_token():
        profile = linkedin.get_profile()
        print(f"Conexión válida. Usuario: {profile.get('name', 'N/A')}")
    else:
        print("Error: Token de LinkedIn inválido o expirado.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Agente de automatización de posts para LinkedIn"
    )
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")

    # Comando: generate
    gen_parser = subparsers.add_parser("generate", help="Genera un post sin publicar")
    gen_parser.add_argument("topic", help="Tema del post")
    gen_parser.set_defaults(func=cmd_generate)

    # Comando: publish
    pub_parser = subparsers.add_parser("publish", help="Genera y publica un post")
    pub_parser.add_argument("--topic", help="Tema para generar el post")
    pub_parser.add_argument("--text", help="Texto directo a publicar")
    pub_parser.add_argument(
        "-y", "--yes", action="store_true", help="Publicar sin confirmación"
    )
    pub_parser.set_defaults(func=cmd_publish)

    # Comando: improve
    imp_parser = subparsers.add_parser("improve", help="Mejora un borrador de post")
    imp_parser.add_argument("draft", help="Borrador del post")
    imp_parser.add_argument(
        "--instructions", "-i", help="Instrucciones para la mejora"
    )
    imp_parser.set_defaults(func=cmd_improve)

    # Comando: validate
    val_parser = subparsers.add_parser(
        "validate", help="Valida la conexión con LinkedIn"
    )
    val_parser.set_defaults(func=cmd_validate)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
