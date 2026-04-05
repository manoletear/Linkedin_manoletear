import { v4 as uuid } from "uuid";
import { GridOption, DraftPost, UserContentProfile } from "../types";
import { llmCompleteJSON } from "../services/llmService";
import { getLearningContext } from "./learningLoop";
import { readFileSync } from "fs";
import { join } from "path";

const COPYWRITER_PROMPT = readFileSync(
  join(__dirname, "../prompts/copywriter.md"),
  "utf-8"
);

export async function generateDrafts(
  option: GridOption,
  profile: UserContentProfile,
  count: number = 3
): Promise<DraftPost[]> {
  // Inyectar contexto de aprendizaje si hay historial
  let learningContext = "";
  try {
    learningContext = await getLearningContext();
  } catch {
    // No learning context available, continue without it
  }

  const raw = await llmCompleteJSON<
    {
      hook: string;
      body: string;
      closing: string;
      hashtags?: string[];
    }[]
  >(
    COPYWRITER_PROMPT + (learningContext ? `\n\n${learningContext}` : ""),
    `Noticia: ${option.headline}
Angulo editorial: ${option.angle}
Razon de priorizacion: ${option.reason}
Formato: ${option.format}

Perfil del autor:
Sector: ${profile.sectors.join(", ")}
Audiencia: ${profile.targetAudience}
Tono: ${profile.preferredTone}
Objetivo: ${profile.publishingGoal}

Genera exactamente ${count} versiones MUY distintas entre si.
Cada version debe variar en: hook, estructura argumental, nivel de contundencia y cierre.

Responde con un array JSON:
[
  {
    "hook": "primera linea que captura atencion",
    "body": "desarrollo con interpretacion propia",
    "closing": "cierre con pregunta o tension abierta",
    "hashtags": ["tag1", "tag2"]
  }
]`
  );

  return raw.map((draft, i) => ({
    draftId: uuid(),
    optionId: option.optionId,
    variant: (i + 1) as 1 | 2 | 3,
    hook: draft.hook,
    body: draft.body,
    closing: draft.closing,
    fullText: `${draft.hook}\n\n${draft.body}\n\n${draft.closing}${
      draft.hashtags?.length ? "\n\n" + draft.hashtags.map((t) => `#${t}`).join(" ") : ""
    }`,
    hashtags: draft.hashtags,
  }));
}
