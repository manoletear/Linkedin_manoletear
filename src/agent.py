"""Entry point para TooxsLkdn - Agente de automatización de LinkedIn."""

import argparse
import os
import sys

from dotenv import load_dotenv

from src.linkedin_client import LinkedInClient
from src.post_generator import PostGenerator
from src.tooxs_lkdn import TooxsLkdn
from src.tooxs_redactor import TooxsRedactor
from src.orchestrator import Orchestrator


def get_env_or_exit(key: str) -> str:
    value = os.getenv(key)
    if not value:
        print(f"Error: Variable de entorno '{key}' no configurada.")
        sys.exit(1)
    return value


def cmd_start(args):
    """Inicia el agente autónomo (solo publicación, sin noticias)."""
    agent = TooxsLkdn()
    agent.start(cron_time=args.time)


def cmd_full(args):
    """Inicia el orquestador completo: noticias + sheets + publicación."""
    orch = Orchestrator()
    orch.start(research_time=args.time)


def cmd_research_now(args):
    """Ejecuta el ciclo completo de investigación + publicación ahora."""
    orch = Orchestrator()
    orch.run_daily_cycle()


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


def cmd_redact(args):
    """Genera una propuesta completa con TooxsRedactor (post + imagen + video)."""
    load_dotenv()
    api_key = get_env_or_exit("ANTHROPIC_API_KEY")
    stability_key = os.getenv("STABILITY_API_KEY")

    redactor = TooxsRedactor(
        anthropic_key=api_key,
        stability_key=stability_key,
        personality_path=os.getenv("PERSONALITY_PATH", "config/Manuel Aravena.md"),
    )

    news = {
        "title": args.title,
        "summary": args.summary or args.title,
        "category": args.category or "IA Empresarial",
        "url": args.url or "",
        "score": 8,
    }

    proposal = redactor.create_proposal(news)

    print("\n--- Post Redactado por TooxsRedactor ---\n")
    print(proposal["post_text"])
    print("\n--- Imagen ---")
    print(f"Prompt: {proposal['image_prompt'][:200]}...")
    print(f"Archivo: {proposal.get('image_path', 'N/A')}")
    print("\n--- Video Storyboard ---")
    sb = proposal.get("storyboard", {})
    print(f"Título: {sb.get('title', 'N/A')}")
    for scene in sb.get("scenes", []):
        print(f"  Escena {scene.get('scene_number')}: {scene.get('text_overlay', '')}")
    print(f"\nPropuesta completa guardada en: output/proposal.json")
    print("\n--- Fin ---\n")


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

    # full: inicia orquestador completo (noticias + sheets + publicación)
    full_p = subparsers.add_parser("full", help="Inicia el ciclo completo: noticias → sheets → LinkedIn")
    full_p.add_argument(
        "--time", default="08:00", help="Hora del ciclo diario HH:MM (default: 08:00)"
    )
    full_p.set_defaults(func=cmd_full)

    # start: inicia solo el publicador
    start_p = subparsers.add_parser("start", help="Inicia solo el publicador (sin noticias)")
    start_p.add_argument(
        "--time", default="09:00", help="Hora de publicación diaria HH:MM (default: 09:00)"
    )
    start_p.set_defaults(func=cmd_start)

    # research-now: ejecuta ciclo completo ahora
    rnow_p = subparsers.add_parser("research-now", help="Busca noticias + publica ahora")
    rnow_p.set_defaults(func=cmd_research_now)

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

    # redact: TooxsRedactor genera propuesta completa
    red_p = subparsers.add_parser("redact", help="TooxsRedactor: post + imagen + video desde una noticia")
    red_p.add_argument("title", help="Título de la noticia")
    red_p.add_argument("--summary", "-s", help="Resumen de la noticia")
    red_p.add_argument("--category", "-c", help="Categoría (ej: PropTech, IA en Construcción)")
    red_p.add_argument("--url", "-u", help="URL de la noticia original")
    red_p.set_defaults(func=cmd_redact)

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
