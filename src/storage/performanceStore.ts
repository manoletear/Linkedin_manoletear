import { v4 as uuid } from "uuid";
import { getDb } from "./db";
import { PublishedPostRecord } from "../types";

export function savePublishedPost(record: Omit<PublishedPostRecord, "id">): string {
  const db = getDb();
  const id = uuid();

  db.prepare(`
    INSERT INTO published_posts (id, draft_id, option_id, news_id, sector, hook_type, tone, format, full_text, linkedin_post_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    record.draftId,
    record.optionId,
    record.newsId,
    record.sector,
    record.hookType,
    record.tone,
    record.format,
    record.fullText,
    record.linkedinPostId || null,
    record.publishedAt
  );

  return id;
}

export function savePostMetrics(
  postId: string,
  metrics: { impressions: number; likes: number; comments: number; reposts: number }
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO post_metrics (post_id, measured_at, impressions, likes, comments, reposts)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(postId, new Date().toISOString(), metrics.impressions, metrics.likes, metrics.comments, metrics.reposts);

  db.prepare(`
    UPDATE published_posts SET impressions = ?, likes = ?, comments = ?, reposts = ? WHERE id = ?
  `).run(metrics.impressions, metrics.likes, metrics.comments, metrics.reposts, postId);
}

export function getHistoricalPerformance(sector?: string): PublishedPostRecord[] {
  const db = getDb();
  const query = sector
    ? `SELECT * FROM published_posts WHERE sector = ? ORDER BY published_at DESC LIMIT 50`
    : `SELECT * FROM published_posts ORDER BY published_at DESC LIMIT 50`;

  const rows = sector ? db.prepare(query).all(sector) : db.prepare(query).all();

  return rows.map((row: any) => ({
    id: row.id,
    draftId: row.draft_id,
    optionId: row.option_id,
    newsId: row.news_id,
    sector: row.sector,
    hookType: row.hook_type,
    tone: row.tone,
    format: row.format,
    fullText: row.full_text,
    linkedinPostId: row.linkedin_post_id,
    publishedAt: row.published_at,
    impressions: row.impressions,
    likes: row.likes,
    comments: row.comments,
    reposts: row.reposts,
  }));
}

export function getTopPatterns(): {
  bestHookTypes: string[];
  bestFormats: string[];
  avgEngagement: number;
} {
  const db = getDb();

  const hookRows = db.prepare(`
    SELECT hook_type, AVG(likes + comments + reposts) as engagement
    FROM published_posts
    WHERE hook_type IS NOT NULL
    GROUP BY hook_type
    ORDER BY engagement DESC
    LIMIT 5
  `).all() as { hook_type: string; engagement: number }[];

  const formatRows = db.prepare(`
    SELECT format, AVG(likes + comments + reposts) as engagement
    FROM published_posts
    WHERE format IS NOT NULL
    GROUP BY format
    ORDER BY engagement DESC
    LIMIT 3
  `).all() as { format: string; engagement: number }[];

  const avgRow = db.prepare(`
    SELECT AVG(likes + comments + reposts) as avg_engagement FROM published_posts
  `).get() as { avg_engagement: number } | undefined;

  return {
    bestHookTypes: hookRows.map((r) => r.hook_type),
    bestFormats: formatRows.map((r) => r.format),
    avgEngagement: avgRow?.avg_engagement || 0,
  };
}
