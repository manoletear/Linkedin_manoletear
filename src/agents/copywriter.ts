import { v4 as uuid } from "uuid";
import { GridOption, DraftPost, UserContentProfile } from "../types";
import { llmCompleteJSON } from "../services/llmService";
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
  const raw = await llmCompleteJSON<
    {
      hook: string;
      body: string;
      closing: string;
      hashtags?: string[];
    }[]
  >(
    COPYWRITER_PROMPT,
    `Noticia: ${option.headline}
Ángulo editorial: ${option.angle}
Razón de priorización: ${option.reason}
Formato: ${option.format}

Perfil del autor:
Sector: ${profile.sectors.join(", ")}
Audiencia: ${profile.targetAudience}
Tono: ${profile.preferredTone}
Objetivo: ${profile.publishingGoal}

Genera exactamente ${count} versiones MUY distintas entre sí.
Cada versión debe variar en: hook, estructura argumental, nivel de contundencia y cierre.

Responde con un array JSON:
[
  {
    "hook": "primera línea que captura atención",
    "body": "desarrollo con interpretación propia",
    "closing": "cierre con pregunta o tensión abierta",
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
