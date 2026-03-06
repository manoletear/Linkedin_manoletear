"""Entry point para TooxsLkdn - Agente de automatización de LinkedIn."""

import argparse
import os
import sys

from dotenv import load_dotenv

from src.linkedin_client import LinkedInClient
from src.post_generator import PostGenerator
from src.tooxs_lkdn import TooxsLkdn


def get_env_or_exit(key: str) -> str:
    value = os.getenv(key)
    if not value:
        print(f"Error: Variable de entorno '{key}' no configurada.")
        sys.exit(1)
    return value


def cmd_start(args):
    """Inicia el agente autónomo."""
    agent = TooxsLkdn()
    agent.start(cron_time=args.time)


def cmd_post_now(args):
    """Ejecuta un post inmediatamente."""
    agent = TooxsLkdn()
    agent.run_once()


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

    if not linkedin.validate_token():
        print("Error: Token de LinkedIn inválido o expirado.")
        sys.exit(1)

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


def cmd_history(args):
    """Muestra el historial de posts publicados."""
    agent = TooxsLkdn()
    if not agent.history:
        print("No hay posts en el historial.")
        return

    limit = args.limit or len(agent.history)
    for entry in agent.history[-limit:]:
        print(f"\n[{entry['timestamp']}] ({entry['status']})")
        print(f"Tema: {entry['topic']}")
        print(f"Post: {entry['post'][:150]}...")
        print("-" * 50)


def main():
    parser = argparse.ArgumentParser(
        prog="TooxsLkdn",
        description="TooxsLkdn - Agente autónomo de posts para LinkedIn",
    )
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")

    # start: inicia el agente autónomo
    start_p = subparsers.add_parser("start", help="Inicia el agente autónomo")
    start_p.add_argument(
        "--time", default="09:00", help="Hora de publicación diaria HH:MM (default: 09:00)"
    )
    start_p.set_defaults(func=cmd_start)

    # post-now: publica inmediatamente
    now_p = subparsers.add_parser("post-now", help="Genera y publica un post ahora")
    now_p.set_defaults(func=cmd_post_now)

    # generate
    gen_p = subparsers.add_parser("generate", help="Genera un post sin publicar")
    gen_p.add_argument("topic", help="Tema del post")
    gen_p.set_defaults(func=cmd_generate)

    # publish
    pub_p = subparsers.add_parser("publish", help="Genera y publica un post")
    pub_p.add_argument("--topic", help="Tema para generar el post")
    pub_p.add_argument("--text", help="Texto directo a publicar")
    pub_p.add_argument("-y", "--yes", action="store_true", help="Sin confirmación")
    pub_p.set_defaults(func=cmd_publish)

    # improve
    imp_p = subparsers.add_parser("improve", help="Mejora un borrador de post")
    imp_p.add_argument("draft", help="Borrador del post")
    imp_p.add_argument("--instructions", "-i", help="Instrucciones para la mejora")
    imp_p.set_defaults(func=cmd_improve)

    # validate
    val_p = subparsers.add_parser("validate", help="Valida conexión con LinkedIn")
    val_p.set_defaults(func=cmd_validate)

    # history
    hist_p = subparsers.add_parser("history", help="Muestra historial de posts")
    hist_p.add_argument("--limit", "-n", type=int, help="Últimos N posts")
    hist_p.set_defaults(func=cmd_history)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
