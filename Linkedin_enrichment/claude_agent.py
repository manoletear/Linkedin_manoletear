"""
Agente Claude: Clasifica perfiles usando Claude API.
Simula el nodo "HTTP Request → Anthropic" + "Code - Parsear respuesta" de n8n.
"""
import json

import requests

from config import ANTHROPIC_API_KEY, CLAUDE_MODEL

PROMPT_TEMPLATE = """Analiza este perfil profesional y responde SOLO con un JSON (sin texto extra, sin markdown) con exactamente estos 3 campos:

{{
  "Industria": "La industria o sector donde trabaja esta persona (ej: Tecnología, Minería, Retail, Construcción, Salud, Educación, Banca y Finanzas, Manufactura, Energía, Agroindustria, Consultoría, Telecomunicaciones, Inmobiliario, Logística, etc.)",
  "Pais": "El país donde está ubicada esta persona (ej: Chile, Argentina, México, Colombia, Perú, etc.)",
  "Poder de Desicion": "El nivel de poder de decisión de compra o contratación: Alto (C-Level, VP, Director, Dueño, Socio, Fundador) / Medio (Gerente, Subgerente, Jefe de área, Head of) / Bajo (Coordinador, Analista, Especialista, Ejecutivo, Asistente)"
}}

PERFIL:
{profile_context}

Responde SOLO el JSON."""


def classify_profile(profile_context: str) -> dict:
    """
    Envía el contexto del perfil a Claude y retorna dict con Industria, Pais, Poder de Desicion.
    """
    if not ANTHROPIC_API_KEY:
        print("  [ERROR] ANTHROPIC_API_KEY no configurada")
        return {}

    prompt = PROMPT_TEMPLATE.format(profile_context=profile_context)

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": CLAUDE_MODEL,
                "max_tokens": 300,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )

        if resp.status_code != 200:
            print(f"  [ERROR] Claude API respondió {resp.status_code}: {resp.text[:300]}")
            return {}

        response_data = resp.json()
        response_text = response_data["content"][0]["text"]

        return _parse_json_response(response_text)

    except requests.RequestException as e:
        print(f"  [ERROR] Claude API falló: {e}")
        return {}


def _parse_json_response(text: str) -> dict:
    """Extrae JSON de la respuesta de Claude, manejando bloques ```json."""
    text = text.strip()

    # Intentar directo
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Intentar extraer de bloque de código
    import re
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Intentar encontrar { ... } en el texto
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    print(f"  [ERROR] No se pudo parsear JSON de Claude: {text[:200]}")
    return {}


if __name__ == "__main__":
    # Test
    test_context = """Nombre: Paulina Contreras Hernández
Empresa: Capital Inteligente Chile
Cargo: Socio Comercial
URL LinkedIn: https://www.linkedin.com/in/paulina-contreras-hernandez/
Headline: Experta en Inversiones Inmobiliarias"""

    result = classify_profile(test_context)
    print(json.dumps(result, indent=2, ensure_ascii=False))
