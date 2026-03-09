"""
Configuración del agente de enriquecimiento LinkedIn.
Carga variables de entorno desde .env
"""
import os
from pathlib import Path

# Cargar .env si existe
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

# Google Sheets
GOOGLE_SHEET_ID = "1KvYX2O4XBmNEshfCljQoq3dU0gk91Px-DPB2LX_4aqM"
GOOGLE_SHEET_GID = "624242335"
GOOGLE_CREDENTIALS_FILE = os.environ.get(
    "GOOGLE_CREDENTIALS_FILE",
    str(Path(__file__).parent / "google_credentials.json"),
)

# Columnas de la Sheet (tal cual aparecen en la fila 1)
SHEET_COLUMNS = [
    "First Name",
    "Last Name",
    "URL",
    "Email Address",
    "Company",
    "Position",
    "Connected On",
    "Industria",
    "Pais",
    "Poder de Desicion",
]

# Columnas a enriquecer
ENRICHMENT_COLUMNS = ["Industria", "Pais", "Poder de Desicion"]

# Columna que contiene la URL de LinkedIn
URL_COLUMN = "URL"

# APIs
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
PROXYCURL_API_KEY = os.environ.get("PROXYCURL_API_KEY", "")

# Modelo Claude
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"

# Procesamiento
BATCH_SIZE = 1  # Perfiles por ejecución (subir si quieres más rápido)
DELAY_BETWEEN_PROFILES = 2  # Segundos entre perfiles
