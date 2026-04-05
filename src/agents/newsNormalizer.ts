import { v4 as uuid } from "uuid";
import { RawNewsItem, NormalizedNewsItem } from "../types";
import { llmCompleteJSON } from "../services/llmService";

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

export async function enrichWithLLM(
  item: NormalizedNewsItem
): Promise<NormalizedNewsItem> {
  const result = await llmCompleteJSON<{
    entities: string[];
    themes: string[];
  }>(
    "Eres un extractor de entidades y temas. Responde solo JSON.",
    `Extrae entidades (empresas, personas, tecnologías) y temas principales de esta noticia:
Título: ${item.title}
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
    toEnrich.map((item) => enrichWithLLM(item))
  );

  return enriched.map((result, i) =>
    result.status === "fulfilled" ? result.value : toEnrich[i]
  );
}
