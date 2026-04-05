import { getTopPatterns, getHistoricalPerformance, saveMemoryChunk } from "../storage/performanceStore";
import { llmCompleteJSON } from "../services/llmService";
import { logger } from "../services/logger";

export type LearningInsight = {
  bestFormats: string[];
  bestHookStyles: string[];
  bestTopics: string[];
  avgEngagement: number;
  recommendations: string[];
};

/**
 * Analiza el historial de posts publicados y genera insights
 * para mejorar los proximos borradores.
 */
export async function analyzePastPerformance(): Promise<LearningInsight | null> {
  try {
    const history = getHistoricalPerformance(30);

    if (history.length < 3) {
      logger.info("Not enough history for learning (need 3+ posts)");
      return null;
    }

    const patterns = getTopPatterns();

    const postsForAnalysis = history.slice(0, 15).map((post: any) => ({
      text: (post.draft_text || "").slice(0, 200),
      format: post.media_type || "text",
      likes: post.likes || 0,
      comments: post.comments || 0,
      reposts: post.reposts || 0,
    }));

    const insight = await llmCompleteJSON<LearningInsight>(
      `Eres un analista de rendimiento de contenido en LinkedIn.
Analiza estos posts publicados y sus metricas para identificar patrones.`,
      `Posts publicados:
${JSON.stringify(postsForAnalysis, null, 2)}

Patrones agregados:
- Mejores formatos: ${patterns.bestFormats.join(", ") || "sin datos"}
- Engagement promedio: ${patterns.avgEngagement.toFixed(1)}
- Total posts: ${patterns.totalPosts}

Responde con JSON:
{
  "bestFormats": ["formato1", "formato2"],
  "bestHookStyles": ["estilo1", "estilo2"],
  "bestTopics": ["tema1", "tema2"],
  "avgEngagement": number,
  "recommendations": ["recomendacion1", "recomendacion2", "recomendacion3"]
}`
    );

    // Guardar insight como memory chunk
    saveMemoryChunk({
      kind: "learning_insight",
      content: JSON.stringify(insight),
      metadata: {
        analyzedPosts: history.length,
        generatedAt: new Date().toISOString(),
      },
    });

    logger.info({ insight }, "Learning insight generated");
    return insight;
  } catch (error) {
    logger.warn({ error: (error as Error).message }, "Learning analysis failed");
    return null;
  }
}

/**
 * Genera contexto de aprendizaje para inyectar en prompts de redaccion.
 */
export async function getLearningContext(): Promise<string> {
  const insight = await analyzePastPerformance();

  if (!insight) {
    return "";
  }

  return `
CONTEXTO DE APRENDIZAJE (basado en ${insight.avgEngagement.toFixed(0)} engagement promedio):
- Formatos que mejor funcionan: ${insight.bestFormats.join(", ")}
- Estilos de hook mas efectivos: ${insight.bestHookStyles.join(", ")}
- Temas con mayor traccion: ${insight.bestTopics.join(", ")}
- Recomendaciones: ${insight.recommendations.join("; ")}
`;
}
