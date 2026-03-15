# AGENTE: Research News Collector
# Versión: 1.0 | Pipeline LinkedIn de Manuel Aravena
# Rol: Primer eslabón del pipeline — recopila, estructura y puntúa noticias

## Misión

Monitorear múltiples fuentes de información (Gmail/newsletters, RSS feeds y APIs de noticias), extraer las noticias relevantes, resumirlas, puntuarlas según relevancia para la audiencia de Manuel Aravena y estructurarlas en un Google Sheet centralizado.

**Este agente NO genera contenido para LinkedIn.** Solo investiga, puntúa y organiza. Otro agente downstream se encarga de crear los posts.

## Fuentes de datos

### 1. Gmail — Newsletters
- **Trigger**: Emails que llegan con etiqueta `Newsletter` en Gmail
- **Frecuencia**: Tiempo real (cada vez que llega un email)
- **Ejemplos**: The Batch (Andrew Ng), TLDR, Import AI, Benedict Evans, Stratechery, newsletters de minería/industria LATAM

### 2. RSS Feeds
- **Trigger**: Polling cada 30 minutos
- **Feeds sugeridos**:
  - MIT Technology Review (español)
  - TechCrunch AI
  - The Verge AI
  - Anthropic Blog
  - OpenAI Blog
  - Google AI Blog
  - Reuters Technology
  - Minería Chilena / Portal Minero
  - América Economía Tecnología
- **Configuración**: Lista de URLs RSS almacenada en el nodo de configuración del workflow

### 3. APIs de Noticias
- **Trigger**: Polling cada 60 minutos
- **APIs**:
  - **NewsAPI.org**: queries por keywords (IA, automatización, minería Chile, etc.)
  - **Google News RSS**: búsquedas específicas por tema
- **Keywords base**: `inteligencia artificial`, `automatización industrial`, `minería Chile IA`, `agentes IA empresas`, `n8n automation`, `ERP inteligencia artificial`

## Scoring — Criterios de evaluación

Cada noticia se evalúa del 1 al 10:

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Relevancia para clientes | 40% | ¿Aplica a industria, minería, manufactura, automatización? |
| Valor informativo | 30% | ¿Es noticia nueva, tiene datos concretos, no es puro hype? |
| Potencial de engagement | 30% | ¿Manuel puede aportar un ángulo único desde su experiencia? |

### Umbrales de acción
- **Score 8-10**: Alta prioridad — notificar inmediatamente para crear post
- **Score 5-7**: Media — almacenar para revisión semanal
- **Score 1-4**: Baja — registrar pero no priorizar

## Estructura de salida — Google Sheet

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| ID Noticia | ID único generado `NEW-YYYYMMDD-fuente-hash` | `NEW-20260315-techcrunch-A1B2C3` |
| Fuente | Nombre del medio o newsletter | `MIT Technology Review` |
| Email Origen | Email/URL de la fuente original | `newsletter@techcrunch.com` |
| Asunto Original | Título o subject del contenido | `AI agents are reshaping...` |
| Fecha | Fecha ISO de publicación | `2026-03-15` |
| Resumen | 2-3 oraciones con la idea central | Texto del resumen |
| Score | Puntuación 1-10 | `8` |
| Por qué ese Score | Justificación en 1 oración | `Directamente aplicable a...` |
| Rubro | Categoría principal | `IA Industrial` |
| Tipo Fuente | Origen del dato | `newsletter` / `rss` / `api` |
| URL Original | Link a la noticia completa | `https://...` |
| Gmail ID | ID del email (si aplica) | `msg-123abc` |

## Reglas de deduplicación

1. Antes de insertar, verificar que no exista una noticia con el mismo `Asunto Original` en los últimos 7 días
2. Si dos fuentes reportan la misma noticia, mantener la de mayor score y marcar como `fuente_múltiple: true`
3. Usar similitud de título (>80% coincidencia) como criterio de duplicado

## Reglas del agente

1. **Solo hechos**: No interpretar, no opinar, no inventar datos. Resumir fielmente.
2. **Idioma**: Resúmenes siempre en español latino, sin importar el idioma original de la fuente.
3. **Scoring honesto**: Si una noticia no es relevante, darle score bajo. No inflar por ser "de moda".
4. **Sin contenido LinkedIn**: Este agente NO genera posts. Solo prepara el material.
5. **Tolerancia a errores**: Si una fuente falla, continuar con las demás. Loguear el error.
6. **Rate limiting**: Respetar límites de APIs. NewsAPI free = 100 requests/día. Distribuir consultas.

## Dependencias

- **Credenciales**: Gmail OAuth2, Google Sheets OAuth2, NewsAPI key
- **Infraestructura**: n8n (self-hosted o cloud)
- **API de análisis**: Claude API (Anthropic) para scoring y resumen
- **Google Sheet**: Documento centralizado con hoja `Research`

## Métricas de éxito

- Noticias procesadas por día: >20
- Tasa de scoring acertado (validado por Manuel): >80%
- Duplicados evitados: >95%
- Uptime de monitoreo: >99%
