import { UserContentProfile, GridOption, DraftPost, DraftEvaluation } from "./types";
import * as NewsCollector from "./agents/newsCollector";
import { normalizeBatch } from "./agents/newsNormalizer";
import { deduplicate } from "./agents/deduplicator";
import { rank } from "./agents/trendAnalyzer";
import { filterLowSignal } from "./agents/editorialScorer";
import { buildGrid } from "./agents/gridGenerator";
import { generateDrafts } from "./agents/copywriter";
import { rankDrafts } from "./agents/editorialCritic";
import { publish } from "./agents/linkedinPublisher";
import { savePublishedPost } from "./storage/performanceStore";
import { logger } from "./services/logger";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function displayGrid(grid: GridOption[]) {
  console.log("\n══════════════════════════════════════════");
  console.log("  GRILLA EDITORIAL");
  console.log("══════════════════════════════════════════\n");

  grid.forEach((option, i) => {
    console.log(`  [${i + 1}] ${option.headline}`);
    console.log(`      Ángulo: ${option.angle}`);
    console.log(`      Formato: ${option.format}`);
    console.log(`      Engagement estimado: ${option.estimatedEngagement}/100`);
    console.log(`      Razón: ${option.reason}`);
    console.log();
  });
}

function displayDrafts(
  drafts: { draft: DraftPost; evaluation: DraftEvaluation }[]
) {
  console.log("\n──────────────────────────────────────────");
  console.log("  BORRADORES");
  console.log("──────────────────────────────────────────\n");

  drafts.forEach(({ draft, evaluation }, i) => {
    console.log(`  ── Borrador ${draft.variant} (Score: ${evaluation.totalScore}/50) ──`);
    console.log();
    console.log(draft.fullText);
    console.log();
    console.log(`  Fortalezas: ${evaluation.strengths.join(", ")}`);
    console.log(`  Debilidades: ${evaluation.weaknesses.join(", ")}`);
    console.log();
  });
}

export async function run(profile: UserContentProfile) {
  try {
    // Paso 1-2: Recolectar noticias
    console.log("\n⏳ Recolectando noticias...");
    const rawNews = await NewsCollector.collect(profile);

    if (rawNews.length === 0) {
      console.log("No se encontraron noticias. Verifica tus fuentes RSS y API keys.");
      return;
    }

    // Paso 3: Normalizar y deduplicar
    console.log("⏳ Normalizando y deduplicando...");
    const normalized = await normalizeBatch(rawNews);
    const deduped = deduplicate(normalized);
    console.log(`  ${rawNews.length} → ${normalized.length} → ${deduped.length} noticias únicas`);

    // Paso 4: Rankear
    console.log("⏳ Rankeando por valor editorial...");
    const ranked = rank(deduped, profile);

    // Paso 5: Filtrar señal baja
    console.log("⏳ Evaluando valor editorial...");
    const publishable = await filterLowSignal(ranked, profile);

    if (publishable.length === 0) {
      console.log("Ninguna noticia alcanzó el umbral editorial. Intenta con otro sector o fuentes.");
      return;
    }

    // Paso 6: Generar grilla
    console.log("⏳ Generando grilla editorial...");
    const grid = await buildGrid(publishable, profile);
    displayGrid(grid);

    // Paso 7: Seleccionar opción
    const optionChoice = await ask(
      "¿Cuál opción quieres desarrollar? (número): "
    );
    const selectedIdx = parseInt(optionChoice, 10) - 1;

    if (selectedIdx < 0 || selectedIdx >= grid.length) {
      console.log("Opción inválida.");
      rl.close();
      return;
    }

    const selectedOption = grid[selectedIdx];

    // Paso 8: Generar y evaluar borradores
    console.log("\n⏳ Generando 3 borradores...");
    const drafts = await generateDrafts(selectedOption, profile);

    console.log("⏳ Evaluando calidad...");
    const ranked_drafts = await rankDrafts(drafts);

    if (ranked_drafts.length > 0) {
      const best = ranked_drafts[0];
      console.log(
        `\n💡 Recomendación: Borrador ${best.draft.variant} (score ${best.evaluation.totalScore}/50)`
      );
    }

    displayDrafts(ranked_drafts);

    // Paso 9: Confirmar publicación
    const draftChoice = await ask(
      "¿Cuál borrador publicar? (número, o 'no' para cancelar): "
    );

    if (draftChoice.toLowerCase() === "no") {
      console.log("Publicación cancelada.");
      rl.close();
      return;
    }

    const draftIdx = parseInt(draftChoice, 10) - 1;
    if (draftIdx < 0 || draftIdx >= ranked_drafts.length) {
      console.log("Opción inválida.");
      rl.close();
      return;
    }

    const chosenDraft = ranked_drafts[draftIdx].draft;

    const confirm = await ask(
      `\n¿Confirmas publicar este borrador en LinkedIn? (si/no): `
    );

    if (confirm.toLowerCase() !== "si") {
      console.log("Publicación cancelada.");
      rl.close();
      return;
    }

    // Paso 10: Publicar
    console.log("\n⏳ Publicando en LinkedIn...");
    const result = await publish(chosenDraft);

    if (result.success) {
      console.log(`✅ Publicado exitosamente. Post ID: ${result.postId}`);

      // Guardar en historial
      savePublishedPost({
        draftId: chosenDraft.draftId,
        optionId: chosenDraft.optionId,
        newsId: selectedOption.newsId,
        sector: profile.sectors[0],
        hookType: chosenDraft.variant.toString(),
        tone: profile.preferredTone,
        format: selectedOption.format,
        fullText: chosenDraft.fullText,
        linkedinPostId: result.postId,
        publishedAt: new Date().toISOString(),
      });
    } else {
      console.log(`❌ Error al publicar: ${result.error}`);
    }

    rl.close();
  } catch (error) {
    logger.error(error, "Pipeline error");
    console.error("Error en el pipeline:", error);
    rl.close();
  }
}

// Ejecución directa
if (require.main === module) {
  const defaultProfile: UserContentProfile = {
    sectors: [process.env.DEFAULT_SECTOR || "technology"],
    keywords: ["AI", "startups", "innovation"],
    preferredTone: "analytical",
    targetAudience: "Profesionales de tecnología y negocios",
    publishingGoal: "authority",
    preferredFormats: ["text"],
  };

  run(defaultProfile);
}
