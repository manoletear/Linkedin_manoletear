/**
 * Test completo del pipeline con datos simulados + LLM real (Groq)
 * Ejecutar: npx ts-node src/test-full-pipeline.ts
 */
import { NormalizedNewsItem, RankedNewsItem, UserContentProfile } from "./types";
import { llmComplete, llmCompleteJSON } from "./services/llmService";
import { rank } from "./agents/trendAnalyzer";
import { filterLowSignal } from "./agents/editorialScorer";
import { buildGrid } from "./agents/gridGenerator";
import { generateDrafts } from "./agents/copywriter";
import { rankDrafts } from "./agents/editorialCritic";

// Noticias simuladas para testing
const MOCK_NEWS: NormalizedNewsItem[] = [
  {
    id: "1",
    source: "McKinsey",
    title: "AI agents are reshaping enterprise operations faster than expected",
    url: "https://mckinsey.com/ai-agents-enterprise",
    summary:
      "A new McKinsey report finds that AI agents in enterprise settings are reducing operational costs by 30-40% in early adopters, with the biggest gains in supply chain and customer service.",
    publishedAt: new Date().toISOString(),
    canonicalText:
      "AI agents are reshaping enterprise operations faster than expected. McKinsey report finds 30-40% cost reduction in early adopters.",
    entities: ["McKinsey", "AI agents", "enterprise"],
    themes: ["AI", "operations", "automation", "enterprise"],
  },
  {
    id: "2",
    source: "BCG",
    title: "The hidden risk of AI copilots: why isolated tools fail at scale",
    url: "https://bcg.com/ai-copilots-risk",
    summary:
      "BCG analysis reveals that companies deploying AI copilots as standalone tools see diminishing returns after 6 months. Integrated AI systems outperform isolated copilots by 3x in productivity gains.",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    canonicalText:
      "The hidden risk of AI copilots: isolated tools fail at scale. BCG shows integrated AI systems outperform standalone copilots by 3x.",
    entities: ["BCG", "AI copilots", "productivity"],
    themes: ["AI", "copilots", "integration", "productivity"],
  },
  {
    id: "3",
    source: "Harvard Business Review",
    title: "Why most companies are wrong about their AI strategy",
    url: "https://hbr.org/ai-strategy-wrong",
    summary:
      "Most companies focus on model selection when the real competitive advantage lies in data infrastructure and workflow orchestration. A study of 500 enterprises reveals the gap.",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    canonicalText:
      "Why most companies are wrong about their AI strategy. Competitive advantage lies in data infrastructure and orchestration, not model selection.",
    entities: ["HBR", "AI strategy", "enterprises"],
    themes: ["AI", "strategy", "data infrastructure", "orchestration"],
  },
];

const TEST_PROFILE: UserContentProfile = {
  sectors: ["technology", "AI"],
  keywords: ["artificial intelligence", "enterprise", "automation"],
  preferredTone: "analytical",
  targetAudience: "CTOs, VPs de tecnologia, fundadores tech en LATAM",
  publishingGoal: "authority",
  preferredFormats: ["text"],
};

async function testLLMConnection() {
  console.log("══════════════════════════════════════════");
  console.log("  TEST COMPLETO DEL PIPELINE");
  console.log("══════════════════════════════════════════\n");

  // 1. Test LLM connection
  console.log("[1/6] Probando conexion con LLM...");
  try {
    const response = await llmComplete(
      "Eres un asistente conciso.",
      "Responde solo con: OK_CONNECTED"
    );
    console.log(`  -> LLM responde: ${response.trim()}\n`);
  } catch (error) {
    console.error(`  -> ERROR: ${(error as Error).message}`);
    console.error("  Verifica tu GROQ_API_KEY en .env");
    process.exit(1);
  }

  // 2. Test JSON mode
  console.log("[2/6] Probando JSON mode...");
  try {
    const json = await llmCompleteJSON<{ status: string; model: string }>(
      "Eres un asistente.",
      'Responde con JSON: { "status": "ok", "model": "llama-3.3-70b" }'
    );
    console.log(`  -> JSON parsed: ${JSON.stringify(json)}\n`);
  } catch (error) {
    console.error(`  -> JSON ERROR: ${(error as Error).message}\n`);
  }

  // 3. Ranking
  console.log("[3/6] Rankeando noticias simuladas...");
  const ranked = rank(MOCK_NEWS, TEST_PROFILE);
  ranked.forEach((item, i) => {
    console.log(`  ${i + 1}. [${item.finalScore.toFixed(1)}] ${item.title}`);
  });
  console.log();

  // 4. Editorial scoring
  console.log("[4/6] Evaluando valor editorial con LLM...");
  try {
    const publishable = await filterLowSignal(ranked, TEST_PROFILE);
    console.log(`  -> ${publishable.length} noticias pasan el filtro editorial`);
    publishable.forEach(({ item, decision }) => {
      console.log(`\n  "${item.title}"`);
      console.log(`  Razon: ${decision.rationale}`);
      console.log(`  Angulos: ${decision.contentAngles.join(" | ")}`);
    });
    console.log();

    if (publishable.length === 0) {
      console.log("  Ninguna noticia paso el filtro. Usando primera para test.\n");
      // Force first item through for testing
    }

    // 5. Generar grilla
    console.log("[5/6] Generando grilla editorial...");
    const grid = await buildGrid(publishable.length > 0 ? publishable : [{ item: ranked[0], decision: { publishWorthy: true, rationale: "Test", contentAngles: ["Test angle"], riskFlags: [] } }], TEST_PROFILE);

    console.log("\n  GRILLA EDITORIAL:");
    grid.forEach((option, i) => {
      console.log(`\n  [${i + 1}] ${option.headline}`);
      console.log(`      Angulo: ${option.angle}`);
      console.log(`      Engagement: ${option.estimatedEngagement}/100`);
      console.log(`      Razon: ${option.reason}`);
    });

    // 6. Generar borradores para la primera opcion
    if (grid.length > 0) {
      console.log("\n[6/6] Generando 3 borradores para opcion 1...");
      const drafts = await generateDrafts(grid[0], TEST_PROFILE);

      console.log("\nEvaluando calidad...");
      const evaluated = await rankDrafts(drafts);

      evaluated.forEach(({ draft, evaluation }) => {
        console.log(`\n  ── Borrador ${draft.variant} (Score: ${evaluation.totalScore}/50) ──`);
        console.log(`  ${draft.fullText.slice(0, 300)}...`);
        console.log(`  Fortalezas: ${evaluation.strengths.join(", ")}`);
        console.log(`  Debilidades: ${evaluation.weaknesses.join(", ")}`);
      });

      if (evaluated.length > 0) {
        const best = evaluated[0];
        console.log(`\n  RECOMENDACION: Borrador ${best.draft.variant} (${best.evaluation.totalScore}/50)`);
      }
    }
  } catch (error) {
    console.error(`  -> Error en pipeline editorial: ${(error as Error).message}`);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  TEST COMPLETADO");
  console.log("══════════════════════════════════════════\n");
}

testLLMConnection().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
