# TooxsLkdn - Agente Autónomo de LinkedIn

Agente que genera y publica posts de LinkedIn de forma automática usando Claude AI. Configura tus temas, programa la hora, y deja que TooxsLkdn haga el resto.

## Funcionalidades

- **Publicación automática diaria** a la hora que configures
- **Generación de contenido con IA** usando Claude (Anthropic)
- **Rotación de temas** desde un archivo configurable
- **Historial de posts** para tracking de lo publicado
- **Modo DRY RUN** para probar sin publicar
- **Comandos manuales** para generar, publicar, mejorar posts

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

## Configuración

### Variables de entorno (.env)

| Variable | Descripción | Default |
|---|---|---|
| `LINKEDIN_ACCESS_TOKEN` | Token de acceso de LinkedIn | requerido |
| `ANTHROPIC_API_KEY` | API Key de Anthropic | requerido |
| `POST_LANGUAGE` | Idioma de los posts | `es` |
| `POST_TONE` | Tono (profesional, casual, inspirador) | `profesional` |
| `DRY_RUN` | `true` = genera sin publicar | `false` |

### Temas (`config/topics.json`)

Edita el archivo para definir los temas sobre los que TooxsLkdn publicará:

```json
{
  "topics": [
    "inteligencia artificial en el trabajo",
    "productividad para profesionales",
    "marca personal en tech"
  ]
}
```

El agente rota entre los temas automáticamente.

## Uso

### Modo autónomo (recomendado)

```bash
# Inicia el agente, publica todos los días a las 09:00
python -m src.agent start

# Publicar a una hora específica
python -m src.agent start --time 14:30
```

### Publicar ahora (un post inmediato)

```bash
python -m src.agent post-now
```

### Comandos manuales

```bash
# Generar post sin publicar
python -m src.agent generate "IA en el trabajo"

# Publicar con tema específico
python -m src.agent publish --topic "liderazgo remoto"

# Publicar texto directo
python -m src.agent publish --text "Mi reflexión sobre..." -y

# Mejorar un borrador
python -m src.agent improve "Hoy aprendí algo..." -i "más inspirador"

# Validar conexión con LinkedIn
python -m src.agent validate

# Ver historial de posts
python -m src.agent history -n 5
```

## Estructura

```
├── src/
│   ├── __init__.py
│   ├── agent.py            # CLI entry point
│   ├── tooxs_lkdn.py       # Agente autónomo TooxsLkdn
│   ├── linkedin_client.py  # Cliente API de LinkedIn
│   └── post_generator.py   # Generador de posts con Claude
├── config/
│   ├── topics.json         # Temas para publicar
│   └── post_history.json   # Historial (auto-generado)
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```
