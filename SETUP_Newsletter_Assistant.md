# Setup: Newsletter Content Assistant
## n8n → Gmail → Claude API → Google Sheets

---

## Arquitectura del flujo

```
Gmail Trigger (label: Newsletter)
    → Extraer Campos Email          [Code - parseo robusto]
    → Cargar SKILL Personalidad     [Code - inyecta tu persona]
    → Analizar con Claude API       [HTTP Request → Anthropic]
    → Procesar y Generar ID         [Code - parsea JSON + ID único]
    → Google Sheets - Agregar Fila  [Google Sheets append]
    → Log Éxito

Error Trigger → Capturar Error
```

---

## Pre-requisitos

- n8n (self-hosted o cloud)
- Cuenta Google con Gmail + Sheets activados
- API Key de Anthropic (Claude)
- Google Sheet creado con las columnas correctas

---

## Paso 1: Crear la Google Sheet

Crea una hoja nueva en Google Sheets con el nombre de pestaña: **Newsletter**

Columnas en fila 1 (exactas, respetan mayúsculas):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID Noticia | Fuente | Asunto Original | Fecha | Resumen | Score | Por qué ese Score | Rubro | Sugerencia Post LinkedIn | Gmail ID |

Copia el **ID del Sheet** desde la URL:
`https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`

---

## Paso 2: Configurar credenciales en n8n

### Gmail OAuth2
1. n8n → Credentials → New → Gmail OAuth2
2. Autorizar con tu cuenta Google
3. Anotar el ID de la credencial

### Google Sheets OAuth2
1. n8n → Credentials → New → Google Sheets OAuth2
2. Usar la misma cuenta Google (o una con acceso al Sheet)

### Anthropic API Key
Opción A — Variable de entorno (recomendada):
```bash
# En tu .env de n8n o docker-compose:
ANTHROPIC_API_KEY=sk-ant-...
```

Opción B — Header directo en el nodo HTTP Request:
- Abre el nodo "Analizar con Claude API"
- En Headers, reemplaza `{{ $env.ANTHROPIC_API_KEY }}` por tu key directa

---

## Paso 3: Importar el workflow

1. n8n → Workflows → Import from file
2. Selecciona `newsletter_content_assistant.json`
3. El workflow se crea desactivado

---

## Paso 4: Configurar el workflow importado

### Nodo: Gmail - Newsletter Label
- Asignar la credencial Gmail OAuth2 que creaste
- Verificar que `labelIds` tenga el nombre exacto de tu etiqueta Gmail
  - Etiquetas en Gmail son case-sensitive
  - Si la etiqueta tiene otro nombre, ajústalo aquí

### Nodo: Google Sheets - Agregar Fila
- Reemplazar `REEMPLAZAR_CON_TU_GOOGLE_SHEET_ID` con el ID real de tu Sheet
- Asignar la credencial Google Sheets OAuth2
- Verificar que el nombre de la pestaña sea `Newsletter`

---

## Paso 5: Obtener el Label ID de Gmail (si falla el trigger)

El Gmail Trigger a veces necesita el ID interno del label, no el nombre.

1. Ve a: https://mail.google.com/mail/u/0/#settings/labels
2. Busca tu etiqueta "Newsletter" y copia el ID (formato: `Label_XXXXXXXXXX`)
3. En el nodo Gmail Trigger, reemplaza `"Newsletter"` por ese ID

Alternativa vía API:
```
GET https://gmail.googleapis.com/gmail/v1/users/me/labels
```

---

## Paso 6: Actualizar la Personalidad (cuando quieras)

La personalidad de Manuel está en el nodo **"Cargar SKILL Personalidad"**.

Para actualizarla sin tocar el flujo principal:
1. Edita el archivo `Personalidad_Manuel_Aravena.md`
2. Copia el contenido relevante
3. Pega en la variable `personalidad` dentro del Code node

También puedes cargarla dinámicamente desde Google Docs o Notion si prefieres tener una fuente única de verdad.

---

## Paso 7: Activar el workflow

1. Ejecutar manualmente primero con un email de prueba
2. Verificar que la fila aparezca correctamente en Google Sheets
3. Activar el workflow (toggle en la esquina superior derecha)

---

## Scoring: Criterios de evaluación

| Score | Interpretación |
|-------|----------------|
| 9-10 | Post urgente — publica hoy |
| 7-8 | Contenido premium — programa esta semana |
| 5-6 | Buen contexto — guarda para relleno |
| 3-4 | Información general — baja prioridad |
| 1-2 | Ruido — ignorar |

---

## Ajustes frecuentes

**Cambiar modelo de Claude:**
En el nodo HTTP Request, campo `model`:
- `claude-sonnet-4-5-20250929` (recomendado, balance calidad/costo)
- `claude-haiku-4-5-20251001` (más rápido y barato, calidad menor)
- `claude-opus-4-5-20251101` (máxima calidad, más costoso)

**Cambiar frecuencia de polling:**
En nodo Gmail Trigger → `pollTimes` → cambiar de `everyMinute` a:
- `everyHour`
- `everyDay`
- O usar cron: `*/15 * * * *` (cada 15 minutos)

**Aumentar contexto del email:**
En nodo "Extraer Campos Email", línea:
```javascript
cuerpo = item.text.substring(0, 8000);
```
Cambiar `8000` según tus necesidades (max recomendado: 15000 chars).

---

## Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| Gmail Trigger no dispara | Label ID incorrecto | Usar el ID interno del label, no el nombre |
| `Cannot read property 'text'` | Email sin cuerpo plano | El Code node ya maneja fallback a snippet/html |
| `JSON parse error` en Claude | Claude devolvió markdown | El parser intenta extraer el JSON del bloque de código automáticamente |
| Fila vacía en Sheets | Nombres de columna no coinciden | Verificar que los nombres en el nodo Sheets sean exactos |
| Score siempre 0 | `parseInt` falla | Claude devolvió score como string no numérico — revisar prompt |

---

## Archivos del proyecto

```
Personalidad_Manuel_Aravena.md    ← SKILL de personalidad (editable)
newsletter_content_assistant.json  ← Workflow n8n para importar
SETUP_Newsletter_Assistant.md     ← Este archivo
```
