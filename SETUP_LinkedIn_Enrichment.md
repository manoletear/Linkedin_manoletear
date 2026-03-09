# Setup: LinkedIn Profile Enrichment Agent
## Google Sheets ↔ Proxycurl ↔ Claude API

Sistema de agentes en Python que enriquece perfiles LinkedIn desde tu Google Sheet, completando las columnas **Industria**, **Pais** y **Poder de Desicion**.

---

## Arquitectura (simula flujo n8n con scripts)

```
run.py (orquestador)
    → sheets_agent.py    → Lee Google Sheet, filtra pendientes
    → proxycurl_agent.py → Obtiene datos del perfil LinkedIn
    → claude_agent.py    → Clasifica: Industria, Pais, Poder de Desicion
    → sheets_agent.py    → Actualiza la fila en Google Sheet
```

---

## Google Sheet conectada

- **ID**: `1KvYX2O4XBmNEshfCljQoq3dU0gk91Px-DPB2LX_4aqM`
- **GID**: `624242335`
- **Columnas**: First Name | Last Name | URL | Email Address | Company | Position | Connected On | **Industria** | **Pais** | **Poder de Desicion**

---

## Pre-requisitos

- Python 3.10+
- API Key de Anthropic (Claude)
- API Key de Proxycurl (opcional, mejora la calidad)
- Google Service Account con acceso a la Sheet

---

## Paso 1: Instalar dependencias

```bash
cd linkedin_enrichment
pip install -r requirements.txt
```

---

## Paso 2: Configurar Google Service Account

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto (o usar uno existente)
3. Habilitar **Google Sheets API** y **Google Drive API**
4. Crear **Service Account** → generar JSON key
5. Guardar el JSON como `linkedin_enrichment/google_credentials.json`
6. Compartir tu Google Sheet con el email del Service Account (el que termina en `@*.iam.gserviceaccount.com`)

---

## Paso 3: Configurar API Keys

```bash
cp .env.example .env
```

Editar `.env`:
```
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
PROXYCURL_API_KEY=tu-proxycurl-key  # opcional
```

---

## Paso 4: Ejecutar

```bash
# Ver perfiles pendientes sin procesar
python run.py --dry-run

# Procesar 1 perfil pendiente
python run.py

# Procesar todos los pendientes
python run.py --all
```

---

## Automatizar con cron (opcional)

Para que corra cada 5 minutos (como un trigger de n8n):

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ajustar rutas):
*/5 * * * * cd /ruta/a/linkedin_enrichment && /ruta/a/python run.py >> enrichment.log 2>&1
```

---

## Estructura de archivos

```
linkedin_enrichment/
├── config.py              ← Configuración centralizada
├── sheets_agent.py        ← Agente Google Sheets (leer/escribir)
├── proxycurl_agent.py     ← Agente Proxycurl (datos LinkedIn)
├── claude_agent.py        ← Agente Claude (clasificación IA)
├── run.py                 ← Orquestador principal
├── requirements.txt       ← Dependencias Python
├── .env.example           ← Template de variables de entorno
└── google_credentials.json ← (tú lo agregas, no va al repo)
```

---

## Cómo funciona cada agente

| Agente | Equivalente n8n | Función |
|--------|----------------|---------|
| `sheets_agent.py` | Google Sheets Read/Update | Lee filas pendientes, actualiza columnas |
| `proxycurl_agent.py` | HTTP Request → Proxycurl | Obtiene datos del perfil vía API |
| `claude_agent.py` | HTTP Request → Anthropic | Clasifica Industria, País, Poder de Decisión |
| `run.py` | Workflow (conexiones) | Orquesta la secuencia de agentes |
| `config.py` | Variables/Credentials | Centraliza configuración |

---

## Costos estimados

| Servicio | Costo por perfil | Gratis |
|----------|-----------------|--------|
| Proxycurl | ~$0.10 | 5/mes |
| Claude Sonnet | ~$0.003 | - |
| Google Sheets | Gratis | Sí |

Sin Proxycurl el sistema funciona con datos de la Sheet (Company, Position) pero la clasificación será menos precisa.
