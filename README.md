# LinkedIn Agent - Automatización de Posts

Agente de automatización de posts para LinkedIn que usa Claude (Anthropic) para generar contenido profesional y publicarlo directamente en tu perfil.

## Funcionalidades

- **Generar posts**: Crea posts optimizados para LinkedIn a partir de un tema
- **Publicar posts**: Genera y publica directamente en tu perfil
- **Mejorar borradores**: Mejora posts existentes con IA
- **Validar conexión**: Verifica que tus credenciales de LinkedIn sean válidas

## Requisitos

- Python 3.10+
- Cuenta de desarrollador en [LinkedIn](https://www.linkedin.com/developers/apps)
- API Key de [Anthropic](https://console.anthropic.com/)

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/manoletear/Linkedin_manoletear.git
cd Linkedin_manoletear

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar credenciales
cp .env.example .env
# Edita .env con tus credenciales
```

## Uso

### Generar un post (sin publicar)

```bash
python -m src.agent generate "inteligencia artificial en el trabajo"
```

### Publicar un post generado por IA

```bash
python -m src.agent publish --topic "tendencias en tech 2026"
```

### Publicar texto directo

```bash
python -m src.agent publish --text "Mi reflexión sobre liderazgo..."
```

### Mejorar un borrador

```bash
python -m src.agent improve "Hoy aprendí algo nuevo..." -i "hazlo más inspirador"
```

### Validar conexión con LinkedIn

```bash
python -m src.agent validate
```

## Configuración

Variables de entorno en `.env`:

| Variable | Descripción |
|---|---|
| `LINKEDIN_ACCESS_TOKEN` | Token de acceso de LinkedIn |
| `ANTHROPIC_API_KEY` | API Key de Anthropic |
| `POST_LANGUAGE` | Idioma de los posts (default: `es`) |
| `POST_TONE` | Tono de los posts (default: `profesional`) |

## Estructura del proyecto

```
├── src/
│   ├── __init__.py
│   ├── agent.py            # Orquestador principal (CLI)
│   ├── linkedin_client.py  # Cliente de la API de LinkedIn
│   └── post_generator.py   # Generador de posts con Claude
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
