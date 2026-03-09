"""
Agente Proxycurl: Obtiene datos de perfil LinkedIn via API.
Simula el nodo "HTTP Request → Proxycurl" de n8n.
"""
import requests

from config import PROXYCURL_API_KEY


def fetch_profile(linkedin_url: str) -> dict:
    """
    Consulta la API de Proxycurl para obtener datos del perfil LinkedIn.
    Retorna dict con datos del perfil o dict vacío si falla.
    """
    if not PROXYCURL_API_KEY:
        print("  [WARN] PROXYCURL_API_KEY no configurada, usando solo datos de la Sheet")
        return {}

    headers = {"Authorization": f"Bearer {PROXYCURL_API_KEY}"}
    params = {
        "linkedin_profile_url": linkedin_url,
        "use_cache": "if-present",
        "fallback_to_cache": "on-error",
    }

    try:
        resp = requests.get(
            "https://nubela.co/proxycurl/api/v2/linkedin",
            headers=headers,
            params=params,
            timeout=30,
        )

        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"  [WARN] Proxycurl respondió {resp.status_code}: {resp.text[:200]}")
            return {}

    except requests.RequestException as e:
        print(f"  [ERROR] Proxycurl falló: {e}")
        return {}


def build_profile_context(profile_data: dict, sheet_data: dict) -> str:
    """
    Construye un string de contexto combinando datos de Proxycurl + Sheet.
    Se usa como input para Claude.
    """
    parts = []

    # Datos de la Sheet (siempre disponibles)
    name = f"{sheet_data.get('first_name', '')} {sheet_data.get('last_name', '')}".strip()
    parts.append(f"Nombre: {name}")
    if sheet_data.get("company"):
        parts.append(f"Empresa: {sheet_data['company']}")
    if sheet_data.get("position"):
        parts.append(f"Cargo: {sheet_data['position']}")
    parts.append(f"URL LinkedIn: {sheet_data.get('url', '')}")

    # Datos de Proxycurl (si están disponibles)
    if profile_data:
        if profile_data.get("headline"):
            parts.append(f"Headline: {profile_data['headline']}")
        if profile_data.get("summary"):
            parts.append(f"Summary: {profile_data['summary'][:500]}")
        if profile_data.get("industry"):
            parts.append(f"Industria (LinkedIn): {profile_data['industry']}")
        if profile_data.get("country_full_name"):
            parts.append(f"País: {profile_data['country_full_name']}")
        if profile_data.get("city"):
            parts.append(f"Ciudad: {profile_data['city']}")

        experiences = profile_data.get("experiences", [])
        if experiences:
            parts.append("\nExperiencia reciente:")
            for exp in experiences[:3]:
                title = exp.get("title", "")
                company = exp.get("company", "")
                parts.append(f"  - {title} en {company}")

        education = profile_data.get("education", [])
        if education:
            parts.append("\nEducación:")
            for edu in education[:2]:
                school = edu.get("school", "")
                degree = edu.get("degree_name", "")
                field = edu.get("field_of_study", "")
                parts.append(f"  - {degree} {field} en {school}")

    return "\n".join(parts)


if __name__ == "__main__":
    # Test con URL de ejemplo
    test_url = "https://www.linkedin.com/in/paulina-contreras-hernandez/"
    print(f"Consultando perfil: {test_url}")
    data = fetch_profile(test_url)
    if data:
        print(f"Nombre: {data.get('full_name')}")
        print(f"Headline: {data.get('headline')}")
        print(f"Industry: {data.get('industry')}")
        print(f"Country: {data.get('country_full_name')}")
    else:
        print("No se obtuvo data (¿API key configurada?)")
