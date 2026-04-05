import { DraftPost, DraftEvaluation } from "../types";
import { llmCompleteJSON } from "../services/llmService";
import { readFileSync } from "fs";
import { join } from "path";

const CRITIC_PROMPT = readFileSync(
  join(__dirname, "../prompts/critic.md"),
  "utf-8"
);

export async function evaluateDraft(
  draft: DraftPost
): Promise<DraftEvaluation> {
  const raw = await llmCompleteJSON<{
    originality: number;
    clarity: number;
    authority: number;
    engagementPotential: number;
    savePotential: number;
    strengths: string[];
    weaknesses: string[];
  }>(
    CRITIC_PROMPT,
    `Borrador a evaluar:

${draft.fullText}

Responde con JSON:
{
  "originality": 1-10,
  "clarity": 1-10,
  "authority": 1-10,
  "engagementPotential": 1-10,
  "savePotential": 1-10,
  "strengths": ["..."],
  "weaknesses": ["..."]
}`
  );

  const totalScore =
    raw.originality +
    raw.clarity +
    raw.authority +
    raw.engagementPotential +
    raw.savePotential;

  return {
    draftId: draft.draftId,
    ...raw,
    totalScore,
  };
}

export async function rankDrafts(
  drafts: DraftPost[]
): Promise<{ draft: DraftPost; evaluation: DraftEvaluation }[]> {
  const evaluations = await Promise.allSettled(
    drafts.map(async (draft) => ({
      draft,
      evaluation: await evaluateDraft(draft),
    }))
  );

  return evaluations
    .filter(
      (r): r is PromiseFulfilledResult<{
        draft: DraftPost;
        evaluation: DraftEvaluation;
      }> => r.status === "fulfilled"
    )
    .map((r) => r.value)
    .sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore);
}
