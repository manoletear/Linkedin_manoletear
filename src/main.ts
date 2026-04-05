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
import { analyzePastPerformance } from "./agents/learningLoop";
import {
  savePublishedPost,
  saveNewsItem,
  getHistoricalPerformance,
  getTopPatterns,
} from "./storage/performanceStore";
import { getProviderStatus } from "./services/llmService";
import { env } from "./config/env";
import { logger } from "./services/logger";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ──────────────────────────────────────
//  MENU PRINCIPAL
// ──────────────────────────────────────

async function mainMenu() {
  console.log("\n══════════════════════════════════════════");
  console.log("  LINKEDIN EDITORIAL AGENT");
  console.log("══════════════════════════════════════════\n");

  // Show LLM provider status
  const providers = await getProviderStatus();
  console.log("  Proveedores LLM:");
  for (const p of providers) {
    const icon = p.available ? "+" : "-";
    console.log(`    [${icon}] ${p.provider}`);
  }
  if (env.GEMINI_API_KEY) {
    console.log(`    [+] gemini (multimodal)`);
  }
  console.log();

  console.log("  1. Correr pipeline editorial");
  console.log("  2. Ver historial de publicaciones");
  console.log("  3. Ver patrones de rendimiento");
  console.log("  4. Analizar aprendizaje");
  console.log("  5. Salir");
  console.log();

  const choice = await ask("Opcion: ");

  switch (choice.trim()) {
    case "1":
      await runPipeline();
      break;
    case "2":
      showHistory();
      break;
    case "3":
      showPatterns();
      break;
    case "4":
      await runLearningAnalysis();
      break;
    case "5":
      console.log("Hasta luego.");
      rl.close();
      return;
    default:
      console.log("Opcion no valida.");
  }

  await mainMenu();
}

// ──────────────────────────────────────
//  PIPELINE EDITORIAL
// ──────────────────────────────────────

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
    console.log(
      `  -- Borrador ${draft.variant} (Score: ${evaluation.totalScore}/50) --`
    );
    console.log();
    console.log(draft.fullText);
    console.log();
    console.log(`  Fortalezas: ${evaluation.strengths.join(", ")}`);
    console.log(`  Debilidades: ${evaluation.weaknesses.join(", ")}`);
    console.log();
  });
}

async function runPipeline() {
  const profile = await getProfile();

  try {
    // Paso 1-2: Recolectar noticias
    console.log("\nRecolectando noticias...");
    const rawNews = await NewsCollector.collect(profile);

    if (rawNews.length === 0) {
      console.log(
        "No se encontraron noticias. Verifica tus fuentes RSS o conexion a internet."
      );
      return;
    }

    // Paso 3: Normalizar y deduplicar
    console.log("Normalizando y deduplicando...");
    const normalized = await normalizeBatch(rawNews);
    const deduped = deduplicate(normalized);
    console.log(
      `  ${rawNews.length} -> ${normalized.length} -> ${deduped.length} noticias unicas`
    );

    // Persistir en SQLite
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
      console.log(
        "Ninguna noticia alcanzo el umbral editorial. Intenta con otro sector o fuentes."
      );
      return;
    }

    console.log(`  ${publishable.length} noticias con valor editorial\n`);

    // Paso 6: Generar grilla
    console.log("Generando grilla editorial...");
    const grid = await buildGrid(publishable, profile);
    displayGrid(grid);

    // Paso 7: Seleccionar opcion
    const optionChoice = await ask(
      "Cual opcion quieres desarrollar? (numero, o 'menu' para volver): "
    );
    if (optionChoice.toLowerCase() === "menu") return;

    const selectedIdx = parseInt(optionChoice, 10) - 1;
    if (selectedIdx < 0 || selectedIdx >= grid.length) {
      console.log("Opcion invalida.");
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

    // Paso 9: Elegir borrador
    const draftChoice = await ask(
      "Cual borrador publicar? (numero, o 'no' para cancelar): "
    );

    if (draftChoice.toLowerCase() === "no") {
      console.log("Publicacion cancelada.");
      return;
    }

    const draftIdx = parseInt(draftChoice, 10) - 1;
    if (draftIdx < 0 || draftIdx >= rankedDrafts.length) {
      console.log("Opcion invalida.");
      return;
    }

    const chosenDraft = rankedDrafts[draftIdx].draft;

    // Preguntar por media
    let mediaAsset: MediaAsset | undefined;
    const mediaChoice = await ask("Adjuntar media? (imagen/pdf/video/no): ");

    if (mediaChoice === "imagen") {
      console.log("Generando imagen con Gemini...");
      mediaAsset = await prepareImageAsset(selectedOption.headline);
      console.log(`Imagen lista: ${mediaAsset.localPath}`);
    } else if (mediaChoice === "pdf") {
      const pdfTitle = selectedOption.headline;
      const pdfPoints = chosenDraft.body
        .split("\n")
        .filter(Boolean)
        .slice(0, 5);
      console.log("Generando PDF...");
      mediaAsset = await preparePdfAsset(pdfTitle, pdfPoints);
      console.log(`PDF listo: ${mediaAsset.localPath}`);
    } else if (mediaChoice === "video") {
      const videoPath = await ask("Ruta al video (ej: out/news-video.mp4): ");
      if (videoPath.trim()) {
        mediaAsset = { type: "video", localPath: videoPath.trim() };
      }
    }

    // Confirmacion final
    const confirm = await ask(
      `\nConfirmas publicar en LinkedIn${mediaAsset ? ` con ${mediaAsset.type}` : ""}? (si/no): `
    );

    if (confirm.toLowerCase() !== "si") {
      console.log("Publicacion cancelada.");
      return;
    }

    // Paso 10: Publicar
    console.log("\nPublicando en LinkedIn...");
    const result = await publish(chosenDraft, mediaAsset);

    if (result.success) {
      console.log(`\nPublicado exitosamente. Post ID: ${result.postId}`);

      savePublishedPost({
        draftId: chosenDraft.draftId,
        linkedinPostId: result.postId,
        mediaType: mediaAsset?.type,
        mediaUrl: mediaAsset?.localPath,
      });

      console.log("Guardado en historial.");
    } else {
      console.log(`\nError al publicar: ${result.error}`);
    }
  } catch (error) {
    logger.error(error, "Pipeline error");
    console.error("Error en el pipeline:", error);
  }
}

// ──────────────────────────────────────
//  HISTORIAL Y PATRONES
// ──────────────────────────────────────

function showHistory() {
  const history = getHistoricalPerformance(20);

  if (history.length === 0) {
    console.log("\nNo hay publicaciones en el historial aun.");
    return;
  }

  console.log("\n──────────────────────────────────────────");
  console.log("  HISTORIAL DE PUBLICACIONES");
  console.log("──────────────────────────────────────────\n");

  history.forEach((post: any, i: number) => {
    const text = (post.draft_text || "").slice(0, 80);
    const engagement = (post.likes || 0) + (post.comments || 0) + (post.reposts || 0);
    console.log(
      `  ${i + 1}. [${post.published_at}] ${post.media_type || "text"} | engagement: ${engagement}`
    );
    console.log(`     ${text}...`);
    console.log();
  });
}

function showPatterns() {
  const patterns = getTopPatterns();

  console.log("\n──────────────────────────────────────────");
  console.log("  PATRONES DE RENDIMIENTO");
  console.log("──────────────────────────────────────────\n");
  console.log(`  Total posts: ${patterns.totalPosts}`);
  console.log(`  Engagement promedio: ${patterns.avgEngagement.toFixed(1)}`);
  console.log(`  Mejores formatos: ${patterns.bestFormats.join(", ") || "sin datos"}`);
  console.log();
}

async function runLearningAnalysis() {
  console.log("\nAnalizando historial con LLM...");
  try {
    const insight = await analyzePastPerformance();
    if (!insight) {
      console.log("No hay suficiente historial (necesitas 3+ posts publicados).");
      return;
    }

    console.log("\n──────────────────────────────────────────");
    console.log("  INSIGHTS DE APRENDIZAJE");
    console.log("──────────────────────────────────────────\n");
    console.log(`  Mejores formatos: ${insight.bestFormats.join(", ")}`);
    console.log(`  Mejores hooks: ${insight.bestHookStyles.join(", ")}`);
    console.log(`  Mejores temas: ${insight.bestTopics.join(", ")}`);
    console.log(`  Engagement promedio: ${insight.avgEngagement.toFixed(1)}`);
    console.log("\n  Recomendaciones:");
    insight.recommendations.forEach((r, i) => {
      console.log(`    ${i + 1}. ${r}`);
    });
    console.log();
  } catch (error) {
    console.error("Error en analisis:", (error as Error).message);
  }
}

// ──────────────────────────────────────
//  PERFIL DEL USUARIO
// ──────────────────────────────────────

async function getProfile(): Promise<UserContentProfile> {
  console.log("\n──────────────────────────────────────────");
  console.log("  CONFIGURAR PERFIL");
  console.log("──────────────────────────────────────────\n");

  const sectorInput = await ask(
    `Sector (default: ${process.env.DEFAULT_SECTOR || "technology"}): `
  );
  const sectors = sectorInput.trim()
    ? sectorInput.split(",").map((s) => s.trim())
    : [process.env.DEFAULT_SECTOR || "technology"];

  const keywordsInput = await ask("Keywords (default: AI, startups, innovation): ");
  const keywords = keywordsInput.trim()
    ? keywordsInput.split(",").map((k) => k.trim())
    : ["AI", "startups", "innovation"];

  const toneInput = await ask(
    "Tono (analytical/provocative/practical/executive, default: analytical): "
  );
  const tone = (toneInput.trim() || "analytical") as UserContentProfile["preferredTone"];

  const audienceInput = await ask(
    "Audiencia (default: Profesionales de tecnologia y negocios en LATAM): "
  );
  const audience =
    audienceInput.trim() || "Profesionales de tecnologia y negocios en LATAM";

  return {
    sectors,
    keywords,
    preferredTone: tone,
    targetAudience: audience,
    publishingGoal: "authority",
    preferredFormats: ["text"],
  };
}

// ──────────────────────────────────────
//  ENTRY POINT
// ──────────────────────────────────────

if (require.main === module) {
  mainMenu().catch((err) => {
    console.error("Error fatal:", err);
    rl.close();
    process.exit(1);
  });
}

export { runPipeline as run };
