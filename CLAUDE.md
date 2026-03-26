# CLAUDE.md — Linkedin_manoletear

## Descripción del proyecto

Repositorio de skills, agentes y configuraciones de automatización para la generación de contenido LinkedIn de Manuel Aravena. Incluye flujos n8n, prompts para Claude API, y definiciones de roles de equipo virtual.

## Estructura del repositorio

```
├── Agentes/                  # Roles del equipo virtual (archivos .skill)
├── Skills/                   # Skills de automatización y contenido (archivos .skill)
├── Personalidad_Manuel_Aravena.md  # Voz, tono y personalidad para posts LinkedIn
├── SETUP_Newsletter_Assistant.md   # Guía de setup del flujo n8n para newsletters
├── newsletter_content_assistant.json  # Workflow n8n exportado
├── *.skill (raíz)           # Skills de roles adicionales
```

## Stack tecnológico

- **Automatización**: n8n (self-hosted o cloud)
- **IA**: Claude API (Anthropic)
- **CRM**: HubSpot
- **Base de datos**: Supabase
- **Email**: Gmail (OAuth2)
- **Hojas de cálculo**: Google Sheets
- **Web**: WordPress

## Convenciones

- Los archivos `.skill` definen prompts/instrucciones para roles o capacidades específicas
- La personalidad y voz de Manuel está en `Personalidad_Manuel_Aravena.md` — siempre consultarlo al generar contenido LinkedIn
- Los agentes en `Agentes/` representan roles del equipo virtual de la empresa
- Los skills en `Skills/` son capacidades técnicas específicas (n8n, contenido, RAG, etc.)

## Contexto de negocio

Manuel Aravena es emprendedor chileno especializado en automatización e IA para empresas industriales (minería, manufactura). Su audiencia en LinkedIn son gerentes de operaciones y profesionales tech en Latinoamérica que buscan ROI concreto con IA.
