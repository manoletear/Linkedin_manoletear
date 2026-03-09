#!/usr/bin/env python3
"""
Orquestador principal: Simula el flujo de n8n ejecutando agentes en secuencia.

Flujo:
  1. [Schedule Trigger]     → Se ejecuta manualmente o con cron
  2. [Sheets Agent]         → Lee perfiles pendientes de Google Sheet
  3. [Filtro]               → Toma 1 perfil pendiente a la vez
  4. [Proxycurl Agent]      → Obtiene datos del perfil LinkedIn
  5. [Claude Agent]         → Clasifica: Industria, Pais, Poder de Desicion
  6. [Sheets Agent]         → Actualiza la fila en Google Sheet
  7. [Log]                  → Reporta resultado

Uso:
  python run.py              # Procesa 1 perfil pendiente
  python run.py --all        # Procesa todos los pendientes
  python run.py --dry-run    # Muestra pendientes sin procesar
"""
import sys
import time

from config import BATCH_SIZE, DELAY_BETWEEN_PROFILES
from sheets_agent import get_pending_profiles, update_row
from proxycurl_agent import fetch_profile, build_profile_context
from claude_agent import classify_profile


def process_one(profile: dict) -> bool:
    """Procesa un perfil: Proxycurl → Claude → Sheet update."""
    name = f"{profile['first_name']} {profile['last_name']}".strip()
    row = profile["row_index"]
    url = profile["url"]

    print(f"\n{'='*60}")
    print(f"[PROCESANDO] Fila {row}: {name}")
    print(f"  URL: {url}")
    print(f"  Empresa: {profile.get('company', '-')}")
    print(f"  Cargo: {profile.get('position', '-')}")

    # Paso 1: Obtener datos de Proxycurl
    print(f"\n  [1/3] Consultando Proxycurl...")
    proxycurl_data = fetch_profile(url)
    if proxycurl_data:
        print(f"        Datos obtenidos de Proxycurl")
    else:
        print(f"        Sin datos de Proxycurl (usando datos de Sheet)")

    # Paso 2: Construir contexto y clasificar con Claude
    print(f"  [2/3] Clasificando con Claude...")
    context = build_profile_context(proxycurl_data, profile)
    result = classify_profile(context)

    if not result:
        print(f"  [FALLO] No se pudo clasificar {name}")
        return False

    print(f"        Industria: {result.get('Industria', '?')}")
    print(f"        Pais: {result.get('Pais', '?')}")
    print(f"        Poder de Desicion: {result.get('Poder de Desicion', '?')}")

    # Paso 3: Actualizar Sheet
    print(f"  [3/3] Actualizando Google Sheet fila {row}...")
    update_row(row, result)
    print(f"        Fila {row} actualizada")

    print(f"\n[OK] {name} enriquecido correctamente")
    return True


def main():
    dry_run = "--dry-run" in sys.argv
    process_all = "--all" in sys.argv
    batch = 999 if process_all else BATCH_SIZE

    print("=" * 60)
    print("LINKEDIN ENRICHMENT AGENT")
    print("=" * 60)

    # Paso 1: Leer pendientes
    print(f"\n[SHEETS AGENT] Leyendo perfiles pendientes...")
    pending = get_pending_profiles(batch_size=batch)

    if not pending:
        print("[OK] No hay perfiles pendientes. Todos tienen Industria, Pais y Poder de Desicion.")
        return

    print(f"[INFO] {len(pending)} perfil(es) pendiente(s)")

    if dry_run:
        print("\n[DRY RUN] Perfiles que se procesarían:")
        for p in pending:
            name = f"{p['first_name']} {p['last_name']}".strip()
            print(f"  Fila {p['row_index']}: {name} ({p['url']})")
        return

    # Paso 2: Procesar cada perfil
    success = 0
    failed = 0

    for i, profile in enumerate(pending):
        ok = process_one(profile)
        if ok:
            success += 1
        else:
            failed += 1

        # Esperar entre perfiles para no saturar APIs
        if i < len(pending) - 1:
            print(f"\n  [WAIT] Esperando {DELAY_BETWEEN_PROFILES}s antes del siguiente...")
            time.sleep(DELAY_BETWEEN_PROFILES)

    # Resumen
    print(f"\n{'='*60}")
    print(f"[RESUMEN]")
    print(f"  Procesados: {success + failed}")
    print(f"  Exitosos:   {success}")
    print(f"  Fallidos:   {failed}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
