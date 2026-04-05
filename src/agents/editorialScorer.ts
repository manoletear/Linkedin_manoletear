import { RankedNewsItem, EditorialDecision, UserContentProfile } from "../types";
import { llmCompleteJSON } from "../services/llmService";

export async function scoreEditorialValue(
  item: RankedNewsItem,
  profile: UserContentProfile
): Promise<EditorialDecision> {
  return llmCompleteJSON<EditorialDecision>(
    `Eres un editor senior de contenido para LinkedIn.
Evalúa si esta noticia merece convertirse en un post para un profesional del sector: ${profile.sectors.join(", ")}.
Audiencia objetivo: ${profile.targetAudience}.
Objetivo: ${profile.publishingGoal}.

Una noticia es apta si cumple al menos 3 de estas condiciones:
- cambia reglas del sector
- afecta decisiones de negocio
- revela tendencia estructural
- contradice narrativas dominantes
- permite insight propio
- conecta con la audiencia objetivo
- tiene timing oportuno

Descartar si: solo es ruido, no añade posicionamiento, ya fue sobreexplotada.`,
    `Noticia:
Título: ${item.title}
Fuente: ${item.source}
Resumen: ${item.summary}
Fecha: ${item.publishedAt}
Score de tendencia: ${item.finalScore}
Entidades: ${item.entities.join(", ")}

Responde con este formato JSON:
{
  "publishWorthy": true/false,
  "rationale": "razón",
  "contentAngles": ["ángulo 1", "ángulo 2", "ángulo 3"],
  "riskFlags": ["riesgo si existe"]
}`
  );
}

export async function filterLowSignal(
  items: RankedNewsItem[],
  profile: UserContentProfile
): Promise<{ item: RankedNewsItem; decision: EditorialDecision }[]> {
  const top = items.slice(0, 10);

  const results = await Promise.allSettled(
    top.map(async (item) => ({
      item,
      decision: await scoreEditorialValue(item, profile),
    }))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<{
        item: RankedNewsItem;
        decision: EditorialDecision;
      }> => r.status === "fulfilled" && r.value.decision.publishWorthy
    )
    .map((r) => r.value);
}
