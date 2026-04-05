/**
 * Captura metricas de posts publicados desde LinkedIn API
 * y las guarda en SQLite para el learning loop.
 *
 * Ejecutar: npx ts-node src/capture-metrics.ts
 */
import { getDb } from "./storage/db";
import { savePostMetrics } from "./storage/performanceStore";
import { getPostMetrics } from "./services/linkedinApi";
import { logger } from "./services/logger";

async function captureAll() {
  const db = getDb();

  const posts = db
    .prepare(
      `SELECT id, linkedin_post_id, published_at
     FROM published_posts
     WHERE linkedin_post_id IS NOT NULL
     ORDER BY published_at DESC
     LIMIT 50`
    )
    .all() as { id: string; linkedin_post_id: string; published_at: string }[];

  if (posts.length === 0) {
    console.log("No hay posts publicados con LinkedIn ID. Publica primero.");
    return;
  }

  console.log(`Capturando metricas de ${posts.length} posts...\n`);

  let captured = 0;
  for (const post of posts) {
    try {
      const metrics = await getPostMetrics(post.linkedin_post_id);
      savePostMetrics(post.id, metrics);
      captured++;

      const total = metrics.likes + metrics.comments + metrics.reposts;
      console.log(
        `  [${post.published_at}] likes:${metrics.likes} comments:${metrics.comments} reposts:${metrics.reposts} total:${total}`
      );
    } catch (error) {
      logger.warn(
        { postId: post.linkedin_post_id, error: (error as Error).message },
        "Failed to capture metrics"
      );
    }
  }

  console.log(`\nCapturadas metricas de ${captured}/${posts.length} posts.`);
}

captureAll().catch(console.error);
