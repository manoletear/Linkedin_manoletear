/**
 * Test de pipeline: recolección de noticias sin LLM
 * Valida Google News RSS + Playwright Scraper
 */
import { fetchGoogleNewsMultiQuery } from "./services/googleNewsService";
import { scrapeTargets, DEFAULT_TARGETS } from "./services/scraperService";
import { normalizeBasic } from "./agents/newsNormalizer";
import { deduplicate } from "./agents/deduplicator";

async function testPipeline() {
  const sector = "inteligencia artificial";
  const queries = [
    "inteligencia artificial empresas",
    "AI enterprise trends 2025",
    "artificial intelligence strategy",
  ];

  console.log("══════════════════════════════════════════");
  console.log("  TEST DE PIPELINE - RECOLECCION");
  console.log("══════════════════════════════════════════\n");

  // 1. Google News RSS
  console.log("[1/4] Consultando Google News RSS...");
  let googleItems: Awaited<ReturnType<typeof fetchGoogleNewsMultiQuery>> = [];
  try {
    googleItems = await fetchGoogleNewsMultiQuery(queries);
    console.log(`  -> ${googleItems.length} noticias encontradas\n`);
    googleItems.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.source}] ${item.title}`);
      console.log(`     ${item.url}`);
      console.log(`     ${item.publishedAt}\n`);
    });
  } catch (error) {
    console.log(`  -> Error: ${(error as Error).message}\n`);
    googleItems = [];
  }

  // 2. Playwright Scraper (consultoras)
  console.log("[2/4] Scrapeando consultoras con Playwright...");
  console.log("  Targets:", DEFAULT_TARGETS.map((t) => t.name).join(", "));
  console.log();

  let scrapedItems: Awaited<ReturnType<typeof scrapeTargets>> = [];
  try {
    // Only scrape first 2 targets for quick test
    const testTargets = DEFAULT_TARGETS.slice(0, 2);
    scrapedItems = await scrapeTargets(testTargets);
    console.log(`  -> ${scrapedItems.length} articulos scrapeados\n`);
    scrapedItems.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.source}] ${item.title}`);
      console.log(`     ${item.url}\n`);
    });
  } catch (error) {
    console.log(`  -> Error scraping: ${(error as Error).message}\n`);
    scrapedItems = [];
  }

  // 3. Normalizar
  const allRaw = [...googleItems, ...scrapedItems];
  console.log(`[3/4] Normalizando ${allRaw.length} items...`);
  const normalized = allRaw.map(normalizeBasic);
  console.log(`  -> ${normalized.length} normalizados\n`);

  // 4. Deduplicar
  console.log("[4/4] Deduplicando...");
  const deduped = deduplicate(normalized);
  console.log(`  -> ${deduped.length} noticias unicas (de ${normalized.length})\n`);

  // Resumen
  console.log("══════════════════════════════════════════");
  console.log("  RESUMEN");
  console.log("══════════════════════════════════════════\n");
  console.log(`  Google News:  ${googleItems.length} items`);
  console.log(`  Scraper:      ${scrapedItems.length} items`);
  console.log(`  Total raw:    ${allRaw.length}`);
  console.log(`  Deduplicados: ${deduped.length}`);
  console.log();

  if (deduped.length > 0) {
    console.log("  TOP 5 noticias:");
    console.log("  ─────────────────────────────────────\n");
    deduped.slice(0, 5).forEach((item, i) => {
      console.log(`  [${i + 1}] ${item.title}`);
      console.log(`      Fuente: ${item.source}`);
      console.log(`      Fecha:  ${item.publishedAt}`);
      console.log(`      URL:    ${item.url}`);
      if (item.summary) {
        console.log(`      Resumen: ${item.summary.slice(0, 120)}...`);
      }
      console.log();
    });
  }

  console.log("Test completado.");
}

testPipeline().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
