import { v4 as uuid } from "uuid";
import { RawNewsItem, NormalizedNewsItem } from "../types";
import { llmCompleteJSON } from "../services/llmService";
import { analyzeArticle } from "../services/geminiService";
import { env } from "../config/env";

export function normalizeBasic(raw: RawNewsItem): NormalizedNewsItem {
  return {
    id: raw.id || uuid(),
    source: raw.source,
    title: raw.title.trim(),
    url: raw.url,
    summary: (raw.summary || raw.rawText || "").slice(0, 500).trim(),
    publishedAt: new Date(raw.publishedAt).toISOString(),
    canonicalText: `${raw.title} ${raw.summary || ""}`.trim(),
    entities: [],
    themes: raw.tags || [],
    imageUrl: raw.imageUrl,
  };
}

/**
 * Enrich with Gemini (multimodal, deeper analysis) if available,
 * otherwise fallback to Groq (text-only extraction).
 */
async function enrichItem(
  item: NormalizedNewsItem
): Promise<NormalizedNewsItem> {
  // Try Gemini first (better at multimodal analysis)
  if (env.GEMINI_API_KEY) {
    try {
      const analysis = await analyzeArticle(item.canonicalText);
      return {
        ...item,
        entities: analysis.entities.length > 0 ? analysis.entities : item.entities,
        themes: analysis.themes.length > 0 ? analysis.themes : item.themes,
        // Store editorial angle in summary if better
        summary: analysis.editorialAngle || item.summary,
      };
    } catch {
      // Fallback to Groq
    }
  }

  // Fallback: Groq/Cerebras text extraction
  const result = await llmCompleteJSON<{
    entities: string[];
    themes: string[];
  }>(
    "Eres un extractor de entidades y temas. Responde solo JSON.",
    `Extrae entidades (empresas, personas, tecnologias) y temas principales:
Titulo: ${item.title}
Resumen: ${item.summary}

Formato: { "entities": [...], "themes": [...] }`
  );

  return {
    ...item,
    entities: result.entities || [],
    themes: result.themes || item.themes,
  };
}

export async function normalizeBatch(
  rawItems: RawNewsItem[]
): Promise<NormalizedNewsItem[]> {
  const basic = rawItems.map(normalizeBasic);

  // Enrich top 20 items to save API calls
  const toEnrich = basic.slice(0, 20);
  const enriched = await Promise.allSettled(
    toEnrich.map((item) => enrichItem(item))
  );

  return enriched.map((result, i) =>
    result.status === "fulfilled" ? result.value : toEnrich[i]
  );
}
