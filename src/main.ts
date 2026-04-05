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
import { prepareImageAsset, preparePdfAsset, MediaAsset } from "./agents/mediaHandler";
import { savePublishedPost, saveNewsItem } from "./storage/performanceStore";
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
    console.log(`      Angulo: ${option.angle}`);
    console.log(`      Formato: ${option.format}`);
    console.log(`      Engagement estimado: ${option.estimatedEngagement}/100`);
    console.log(`      Razon: ${option.reason}`);
    console.log();
  });
}

function displayDrafts(
  drafts: { draft: DraftPost; evaluation: DraftEvaluation }[]
) {
  console.log("\n──────────────────────────────────────────");
  console.log("  BORRADORES");
  console.log("──────────────────────────────────────────\n");

  drafts.forEach(({ draft, evaluation }) => {
    console.log(`  -- Borrador ${draft.variant} (Score: ${evaluation.totalScore}/50) --`);
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
    console.log("\nRecolectando noticias...");
    const rawNews = await NewsCollector.collect(profile);

    if (rawNews.length === 0) {
      console.log("No se encontraron noticias. Verifica tus fuentes RSS o conexion a internet.");
      return;
    }

    // Paso 3: Normalizar y deduplicar
    console.log("Normalizando y deduplicando...");
    const normalized = await normalizeBatch(rawNews);
    const deduped = deduplicate(normalized);
    console.log(`  ${rawNews.length} -> ${normalized.length} -> ${deduped.length} noticias unicas`);

    // Persistir noticias en SQLite
    for (const item of deduped.slice(0, 20)) {
      saveNewsItem({
        source: item.source,
        title: item.title,
        url: item.url,
        summary: item.summary,
        publishedAt: item.publishedAt,
        canonicalText: item.canonicalText,
      });
    }

    // Paso 4: Rankear
    console.log("Rankeando por valor editorial...");
    const ranked = rank(deduped, profile);

    // Paso 5: Filtrar senal baja
    console.log("Evaluando valor editorial con LLM...");
    const publishable = await filterLowSignal(ranked, profile);

    if (publishable.length === 0) {
      console.log("Ninguna noticia alcanzo el umbral editorial. Intenta con otro sector o fuentes.");
      return;
    }

    console.log(`  ${publishable.length} noticias con valor editorial\n`);

    // Paso 6: Generar grilla
    console.log("Generando grilla editorial...");
    const grid = await buildGrid(publishable, profile);
    displayGrid(grid);

    // Paso 7: Seleccionar opcion
    const optionChoice = await ask(
      "Cual opcion quieres desarrollar? (numero): "
    );
    const selectedIdx = parseInt(optionChoice, 10) - 1;

    if (selectedIdx < 0 || selectedIdx >= grid.length) {
      console.log("Opcion invalida.");
      rl.close();
      return;
    }

    const selectedOption = grid[selectedIdx];

    // Paso 8: Generar y evaluar borradores
    console.log("\nGenerando 3 borradores...");
    const drafts = await generateDrafts(selectedOption, profile);

    console.log("Evaluando calidad...");
    const rankedDrafts = await rankDrafts(drafts);

    if (rankedDrafts.length > 0) {
      const best = rankedDrafts[0];
      console.log(
        `\nRecomendacion: Borrador ${best.draft.variant} (score ${best.evaluation.totalScore}/50)`
      );
    }

    displayDrafts(rankedDrafts);

    // Paso 9: Confirmar publicacion
    const draftChoice = await ask(
      "Cual borrador publicar? (numero, o 'no' para cancelar): "
    );

    if (draftChoice.toLowerCase() === "no") {
      console.log("Publicacion cancelada.");
      rl.close();
      return;
    }

    const draftIdx = parseInt(draftChoice, 10) - 1;
    if (draftIdx < 0 || draftIdx >= rankedDrafts.length) {
      console.log("Opcion invalida.");
      rl.close();
      return;
    }

    const chosenDraft = rankedDrafts[draftIdx].draft;

    // Preguntar por media
    let mediaAsset: MediaAsset | undefined;
    const mediaChoice = await ask(
      "Adjuntar media? (imagen/pdf/no): "
    );

    if (mediaChoice === "imagen") {
      console.log("Generando imagen con Gemini...");
      mediaAsset = await prepareImageAsset(selectedOption.headline);
      console.log(`Imagen lista: ${mediaAsset.localPath}`);
    } else if (mediaChoice === "pdf") {
      const pdfTitle = selectedOption.headline;
      const pdfPoints = chosenDraft.body.split("\n").filter(Boolean).slice(0, 5);
      console.log("Generando PDF...");
      mediaAsset = await preparePdfAsset(pdfTitle, pdfPoints);
      console.log(`PDF listo: ${mediaAsset.localPath}`);
    }

    const confirm = await ask(
      `\nConfirmas publicar este borrador en LinkedIn? (si/no): `
    );

    if (confirm.toLowerCase() !== "si") {
      console.log("Publicacion cancelada.");
      rl.close();
      return;
    }

    // Paso 10: Publicar
    console.log("\nPublicando en LinkedIn...");
    const result = await publish(chosenDraft);

    if (result.success) {
      console.log(`Publicado exitosamente. Post ID: ${result.postId}`);

      savePublishedPost({
        draftId: chosenDraft.draftId,
        linkedinPostId: result.postId,
        mediaType: mediaAsset?.type,
        mediaUrl: mediaAsset?.localPath,
      });
    } else {
      console.log(`Error al publicar: ${result.error}`);
    }

    rl.close();
  } catch (error) {
    logger.error(error, "Pipeline error");
    console.error("Error en el pipeline:", error);
    rl.close();
  }
}

// Ejecucion directa
if (require.main === module) {
  const defaultProfile: UserContentProfile = {
    sectors: [process.env.DEFAULT_SECTOR || "technology"],
    keywords: ["AI", "startups", "innovation"],
    preferredTone: "analytical",
    targetAudience: "Profesionales de tecnologia y negocios en LATAM",
    publishingGoal: "authority",
    preferredFormats: ["text"],
  };

  run(defaultProfile);
}
