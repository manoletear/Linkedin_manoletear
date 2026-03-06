# TooxsLkdn - Agente Autónomo de LinkedIn + Investigación de Noticias

Sistema de tres agentes que trabajan juntos:
1. **TooxsNews** - Busca noticias diarias del sector inmobiliario + IA en construcción, herramientas de IA para la industria y aplicaciones de Claude/Anthropic en real estate. Las analiza, puntúa y registra en Google Sheets.
2. **TooxsRedactor** - Lee el perfil de personalidad de Manuel Aravena, redacta posts con su voz, genera imágenes con Stability AI y crea storyboards de video.
3. **TooxsLkdn** - Publica los posts en LinkedIn.

## Flujo Diario Automático

```
08:00  TooxsNews busca noticias (Google News RSS / Serper / NewsAPI)
   ↓   Claude analiza y puntúa cada noticia (score 1-10)
   ↓   Categoriza: Inmobiliario, IA en Construcción, PropTech, Herramientas IA, Claude & Anthropic...
   ↓   Registra en Google Sheets: ID, rubro, fecha, resumen, link, score, herramientas IA
   ↓   TooxsRedactor selecciona la mejor noticia
   ↓   Redacta el post con la voz de Manuel Aravena
   ↓   Genera imagen con Stability AI
   ↓   Crea storyboard de video (4-5 escenas)
09:00  TooxsLkdn publica el post en LinkedIn
```

## Google Sheets Output

Cada fila de la hoja `Noticias_IA_Inmobiliario` contiene:

| Columna | Descripción |
|---|---|
| ID Noticia | Hash único de 12 caracteres |
| Rubro | Inmobiliario, IA en Construcción, PropTech, Herramientas IA, Claude & Anthropic, etc. |
| Fecha | Fecha de registro (YYYY-MM-DD) |
| Título | Título de la noticia |
| Resumen | Resumen de 2-3 oraciones en español |
| Link | URL original de la noticia |
| Score | 1-10 según relevancia para el sector |
| Herramientas IA | Herramientas mencionadas (ej: Claude, Python, TensorFlow) |

## Instalación

```bash
git clone https://github.com/manoletear/Linkedin_manoletear.git
cd Linkedin_manoletear

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edita .env con tus credenciales
```

### Configurar Google Sheets

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto y habilita la API de Google Sheets y Google Drive
3. Crea una Service Account y descarga el JSON de credenciales
4. Guarda el JSON como `config/credentials.json`
5. Crea un Google Sheet y comparte con el email de la Service Account
6. Copia el ID del Spreadsheet (de la URL) a `GOOGLE_SPREADSHEET_ID` en `.env`

### Configurar APIs de búsqueda

TooxsNews usa **Google News RSS** como fuente gratuita (no necesita API key). Opcionalmente puedes añadir:
- **Serper** (recomendado): Regístrate en [serper.dev](https://serper.dev/) y copia tu API key
- **NewsAPI**: Regístrate en [newsapi.org](https://newsapi.org/) y copia tu API key

## Uso

### Modo completo (recomendado) - Noticias + Sheets + LinkedIn

```bash
# Inicia el ciclo diario completo a las 08:00
python -m src.agent full

# Cambiar la hora del ciclo
python -m src.agent full --time 07:30

# Ejecutar un ciclo completo AHORA (búsqueda + análisis + publicación)
python -m src.agent research-now
```

### Modo solo publicación (sin noticias)

```bash
# Publica diariamente a las 09:00 con temas de config/topics.json
python -m src.agent start

# Publicar un post inmediato
python -m src.agent post-now
```

### TooxsRedactor - Redacción con personalidad + imagen + video

```bash
# Crear propuesta completa desde una noticia
python -m src.agent redact "IA revoluciona las valoraciones inmobiliarias" \
  -s "Nuevas herramientas de IA permiten valorar propiedades con 95% de precisión" \
  -c "PropTech"

# La propuesta se guarda en output/proposal.json con:
# - Post redactado con la voz de Manuel Aravena
# - Imagen generada (o prompt si no hay STABILITY_API_KEY)
# - Storyboard de video con 4-5 escenas
```

### Comandos manuales

```bash
# Generar post sin publicar
python -m src.agent generate "IA en el sector inmobiliario"

# Publicar con tema específico
python -m src.agent publish --topic "proptech y automatización"

# Publicar texto directo
python -m src.agent publish --text "Mi reflexión sobre..." -y

# Mejorar un borrador
python -m src.agent improve "Hoy aprendí algo..." -i "más profesional"

# Validar conexión LinkedIn
python -m src.agent validate

# Ver historial de posts
python -m src.agent history -n 5
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `LINKEDIN_ACCESS_TOKEN` | Token de LinkedIn | Sí |
| `ANTHROPIC_API_KEY` | API Key de Anthropic (Claude) | Sí |
| `GOOGLE_SPREADSHEET_ID` | ID del Google Sheet | Para `full`/`research-now` |
| `GOOGLE_CREDENTIALS_PATH` | Ruta al JSON de credenciales | Para `full`/`research-now` |
| `STABILITY_API_KEY` | API Key de Stability AI (imágenes) | No (opcional) |
| `PERSONALITY_PATH` | Ruta al archivo de personalidad | No (default: `config/Manuel Aravena.md`) |
| `SERPER_API_KEY` | API Key de Serper | No (opcional) |
| `NEWSAPI_KEY` | API Key de NewsAPI | No (opcional) |
| `POST_LANGUAGE` | Idioma de los posts (default: `es`) | No |
| `POST_TONE` | Tono (profesional, casual, inspirador) | No |
| `DRY_RUN` | `true` = no publica en LinkedIn | No |

## Estructura

```
├── src/
│   ├── __init__.py
│   ├── agent.py             # CLI entry point
│   ├── orchestrator.py      # Orquestador (conecta los tres agentes)
│   ├── tooxs_lkdn.py        # TooxsLkdn - Agente de publicación LinkedIn
│   ├── tooxs_redactor.py    # TooxsRedactor - Redacción + imagen + video
│   ├── news_researcher.py   # TooxsNews - Agente de investigación de noticias
│   ├── sheets_client.py     # Cliente de Google Sheets
│   ├── linkedin_client.py   # Cliente API de LinkedIn
│   └── post_generator.py    # Generador de posts con Claude
├── config/
│   ├── Manuel Aravena.md     # Perfil de personalidad para TooxsRedactor
│   ├── topics.json           # Temas para modo solo-publicación
│   ├── credentials.json      # Credenciales Google (no versionado)
│   └── post_history.json     # Historial de posts (auto-generado)
├── output/                    # Propuestas generadas por TooxsRedactor (auto-generado)
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
