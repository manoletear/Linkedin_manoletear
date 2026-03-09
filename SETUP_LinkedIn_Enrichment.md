# Setup: LinkedIn Profile Enrichment
## Google Sheets ↔ Proxycurl ↔ Claude API ↔ Google Sheets

---

## Arquitectura del flujo

```
Schedule Trigger (cada 5 min)
    → Google Sheets - Leer Perfiles         [Lee todas las filas]
    → Filtrar Pendientes (1 a la vez)       [Code - solo sin resumen]
    → Proxycurl - Obtener Perfil LinkedIn   [HTTP Request → API]
    → Preparar Contexto para Claude         [Code - estructura datos]
    → Claude API - Generar Resumen          [HTTP Request → Anthropic]
    → Procesar Respuesta Claude             [Code - parsea JSON + ID]
    → Google Sheets - Actualizar Fila       [Google Sheets update]
    → Log Éxito

Error Trigger → Capturar Error
```

---

## Pre-requisitos

- n8n (self-hosted o cloud)
- Cuenta Google con Sheets activados
- API Key de Anthropic (Claude)
- API Key de Proxycurl (https://nubela.co/proxycurl) — plan gratuito incluye 5 créditos/mes
- Google Sheet creado con las columnas correctas

---

## Paso 1: Crear la Google Sheet

Crea una hoja nueva en Google Sheets con el nombre de pestaña: **LinkedIn**

Columnas en fila 1 (exactas):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| URL LinkedIn | Nombre Completo | Cargo Actual | Empresa Actual | Industria | Rubro | Ubicación | Años Experiencia | Resumen | Habilidades Clave | Nivel Decisión | Potencial Contacto | Tema Conversación | Fecha Enriquecimiento | Estado | ID Enriquecimiento |

### Llenar la columna A

Pega tus URLs de LinkedIn en la columna **URL LinkedIn**, una por fila:
```
https://www.linkedin.com/in/paulina-contreras-hernandez/
https://www.linkedin.com/in/otro-perfil/
...
```

El flujo procesará **uno por uno** los perfiles que no tengan la columna "Estado" en "Completado".

Copia el **ID del Sheet** desde la URL:
`https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`

---

## Paso 2: Obtener API Key de Proxycurl

1. Registrarse en https://nubela.co/proxycurl
2. Plan gratuito: 5 créditos/mes (1 crédito = 1 perfil)
3. Plan de pago: desde $49/mes para 500 créditos
4. Copiar tu API Key desde el dashboard

### Alternativa sin Proxycurl

Si no quieres usar Proxycurl, el workflow incluye un nodo alternativo deshabilitado (**"Alternativa - Búsqueda Web"**) que extrae datos básicos del nombre de usuario del URL. Para usarlo:

1. Deshabilita el nodo "Proxycurl - Obtener Perfil LinkedIn"
2. Habilita el nodo "Alternativa - Búsqueda Web (sin API)"
3. Reconecta las conexiones en el canvas

> Nota: La alternativa web dará datos muy limitados. Proxycurl es la opción recomendada.

---

## Paso 3: Configurar credenciales en n8n

### Google Sheets OAuth2
1. n8n → Credentials → New → Google Sheets OAuth2
2. Autorizar con tu cuenta Google
3. Anotar el ID de la credencial

### Proxycurl API Key
1. n8n → Credentials → New → Header Auth
2. Name: `Authorization`
3. Value: `Bearer TU_PROXYCURL_API_KEY`

### Anthropic API Key
Opción A — Variable de entorno (recomendada):
```bash
# En tu .env de n8n o docker-compose:
ANTHROPIC_API_KEY=sk-ant-...
```

Opción B — Header directo en el nodo HTTP Request:
- Abre el nodo "Claude API - Generar Resumen"
- En Headers, reemplaza `{{ $env.ANTHROPIC_API_KEY }}` por tu key directa

---

## Paso 4: Importar el workflow

1. n8n → Workflows → Import from file
2. Selecciona `linkedin_enrichment_workflow.json`
3. El workflow se crea desactivado

---

## Paso 5: Configurar el workflow importado

### Nodo: Google Sheets - Leer Perfiles
- Reemplazar `REEMPLAZAR_CON_TU_GOOGLE_SHEET_ID` con el ID real de tu Sheet
- Asignar la credencial Google Sheets OAuth2
- Verificar que el nombre de la pestaña sea `LinkedIn`

### Nodo: Google Sheets - Actualizar Fila
- Mismo Sheet ID que el anterior
- Misma credencial

### Nodo: Proxycurl - Obtener Perfil LinkedIn
- Asignar la credencial Header Auth con tu API Key de Proxycurl

### Nodo: Claude API - Generar Resumen
- Verificar que `ANTHROPIC_API_KEY` esté configurada como variable de entorno
- O reemplazar con tu key directa en el header

---

## Paso 6: Activar el workflow

1. Ejecutar manualmente primero con un perfil de prueba
2. Verificar que la fila se actualice en Google Sheets con todos los campos
3. Activar el workflow (toggle en la esquina superior derecha)

---

## Datos que se enriquecen por perfil

| Campo | Descripción |
|-------|-------------|
| Nombre Completo | Nombre real del perfil |
| Cargo Actual | Titular/headline de LinkedIn |
| Empresa Actual | Empresa donde trabaja hoy |
| Industria | Sector principal (Tecnología, Minería, etc.) |
| Rubro | Rubro específico del negocio |
| Ubicación | Ciudad y país |
| Años Experiencia | Estimación basada en trayectoria |
| Resumen | Resumen profesional de 3-4 líneas generado por Claude |
| Habilidades Clave | Top skills relevantes |
| Nivel Decisión | C-Level / Director / Gerente / Coordinador / Especialista |
| Potencial Contacto | Alto / Medio / Bajo — relevancia para automatización e IA |
| Tema Conversación | Sugerencia de tema para primer contacto |
| Fecha Enriquecimiento | Fecha en que se procesó |
| Estado | Completado / Pendiente |

---

## Flujo visual

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│  Schedule    │───▶│ Google Sheet  │───▶│ Filtrar 1      │
│  (5 min)     │    │ Leer Filas   │    │ Pendiente      │
└─────────────┘    └──────────────┘    └───────┬────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │ Proxycurl API    │
                                    │ Obtener Perfil   │
                                    └───────┬──────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐
                                    │ Preparar Contexto│
                                    │ para Claude      │
                                    └───────┬──────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐
                                    │ Claude API       │
                                    │ Generar Resumen  │
                                    └───────┬──────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐
                                    │ Procesar JSON    │
                                    │ Respuesta Claude │
                                    └───────┬──────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐    ┌──────────┐
                                    │ Google Sheet     │───▶│ Log      │
                                    │ Actualizar Fila  │    │ Éxito    │
                                    └──────────────────┘    └──────────┘
```

---

## Ajustes frecuentes

**Cambiar frecuencia de procesamiento:**
En Schedule Trigger → cambiar `minutesInterval` de 5 a lo que necesites.

**Cambiar modelo de Claude:**
En nodo HTTP Request "Claude API", campo `model`:
- `claude-sonnet-4-5-20250929` (recomendado, balance calidad/costo)
- `claude-haiku-4-5-20251001` (más rápido y barato)

**Procesar más de 1 perfil por ejecución:**
En nodo "Filtrar Pendientes", cambiar:
```javascript
// De: return [pendientes[0]];
// A:  return pendientes.slice(0, 3); // procesa 3 a la vez
```
> Cuidado con rate limits de Proxycurl y Claude API.

---

## Costos estimados

| Servicio | Costo por perfil | Plan gratuito |
|----------|-----------------|---------------|
| Proxycurl | ~$0.10/perfil | 5 créditos/mes |
| Claude API (Sonnet) | ~$0.003/perfil | - |
| Google Sheets | Gratis | Sí |
| n8n Cloud | Incluido en plan | 5 workflows gratis |

**Total estimado**: ~$0.10 por perfil enriquecido

---

## Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| No procesa perfiles | Columna "Estado" ya dice "Completado" | Borrar el estado de las filas pendientes |
| Proxycurl 404 | URL de LinkedIn mal formada | Verificar formato: `linkedin.com/in/username/` |
| Proxycurl 429 | Rate limit excedido | Reducir frecuencia del trigger |
| Claude JSON error | Claude no devolvió JSON válido | El parser maneja `\`\`\`json` automáticamente |
| Sheet no actualiza | Nombres de columna no coinciden | Verificar que los headers sean exactos |
| Credenciales fallan | OAuth2 expirado | Re-autorizar en n8n Credentials |

---

## Archivos del proyecto

```
linkedin_enrichment_workflow.json     ← Workflow n8n para importar
SETUP_LinkedIn_Enrichment.md          ← Este archivo
```
