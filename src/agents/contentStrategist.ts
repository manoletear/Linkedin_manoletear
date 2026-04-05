import { v4 as uuid } from "uuid";
import { RankedNewsItem, ContentAngle, UserContentProfile } from "../types";
import { llmCompleteJSON } from "../services/llmService";
import { readFileSync } from "fs";
import { join } from "path";

const STRATEGIST_PROMPT = readFileSync(
  join(__dirname, "../prompts/strategist.md"),
  "utf-8"
);

export async function generateAngles(
  item: RankedNewsItem,
  profile: UserContentProfile
): Promise<ContentAngle[]> {
  const raw = await llmCompleteJSON<
    { title: string; thesis: string; audienceFit: string; whyNow: string }[]
  >(
    STRATEGIST_PROMPT,
    `Noticia:
Título: ${item.title}
Fuente: ${item.source}
Resumen: ${item.summary}
Entidades: ${item.entities.join(", ")}
Temas: ${item.themes.join(", ")}

Perfil del autor:
Sector: ${profile.sectors.join(", ")}
Audiencia: ${profile.targetAudience}
Tono: ${profile.preferredTone}
Objetivo: ${profile.publishingGoal}

Genera exactamente 3 ángulos (analítico, provocador, práctico).
Responde con un array JSON:
[
  { "title": "...", "thesis": "...", "audienceFit": "...", "whyNow": "..." }
]`
  );

  return raw.map((angle) => ({
    angleId: uuid(),
    ...angle,
  }));
}
