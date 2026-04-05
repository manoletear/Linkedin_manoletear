import { v4 as uuid } from "uuid";
import { getDb } from "./db";
import { logger } from "../services/logger";

export function saveNewsItem(item: {
  source: string;
  title: string;
  url: string;
  summary?: string;
  publishedAt?: string;
  canonicalText?: string;
}) {
  const db = getDb();
  try {
    db.prepare(`
      INSERT OR IGNORE INTO news_items (id, source, title, url, summary, published_at, canonical_text, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `).run(uuid(), item.source, item.title, item.url, item.summary || null, item.publishedAt || null, item.canonicalText || null);
  } catch (error) {
    logger.warn({ error: (error as Error).message, url: item.url }, "Failed to save news item");
  }
}

export function saveContentOption(option: {
  newsItemId: string;
  angleTitle: string;
  thesis: string;
  format: string;
  score?: number;
}): string {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO content_options (id, news_item_id, angle_title, thesis, format, score)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, option.newsItemId, option.angleTitle, option.thesis, option.format, option.score || null);
  return id;
}

export function saveDraft(draft: {
  contentOptionId: string;
  variant: number;
  fullText: string;
  score?: number;
}): string {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO drafts (id, content_option_id, variant, full_text, score)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, draft.contentOptionId, draft.variant, draft.fullText, draft.score || null);
  return id;
}

export function markDraftSelected(draftId: string) {
  const db = getDb();
  db.prepare(`UPDATE drafts SET selected = 1 WHERE id = ?`).run(draftId);
}

export function savePublishedPost(record: {
  draftId: string;
  linkedinPostId?: string;
  mediaType?: string;
  mediaUrl?: string;
}): string {
  const db = getDb();
  const id = uuid();
  db.prepare(`
    INSERT INTO published_posts (id, draft_id, linkedin_post_id, media_type, media_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, record.draftId, record.linkedinPostId || null, record.mediaType || null, record.mediaUrl || null);
  return id;
}

export function savePostMetrics(
  publishedPostId: string,
  metrics: { impressions: number; likes: number; comments: number; reposts: number }
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO post_metrics (published_post_id, impressions, likes, comments, reposts)
    VALUES (?, ?, ?, ?, ?)
  `).run(publishedPostId, metrics.impressions, metrics.likes, metrics.comments, metrics.reposts);
}

export function saveMemoryChunk(chunk: {
  kind: string;
  refId?: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO memory_chunks (id, kind, ref_id, content, metadata)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuid(), chunk.kind, chunk.refId || null, chunk.content, JSON.stringify(chunk.metadata || {}));
}

export function getHistoricalPerformance(limit: number = 50) {
  const db = getDb();
  const posts = db.prepare(`
    SELECT pp.*, d.full_text as draft_text, d.variant,
           pm.impressions, pm.likes, pm.comments, pm.reposts
    FROM published_posts pp
    LEFT JOIN drafts d ON d.id = pp.draft_id
    LEFT JOIN post_metrics pm ON pm.published_post_id = pp.id
    ORDER BY pp.published_at DESC
    LIMIT ?
  `).all(limit) as any[];

  return posts;
}

export function getTopPatterns(): {
  bestFormats: string[];
  avgEngagement: number;
  totalPosts: number;
} {
  const db = getDb();

  const formatRows = db.prepare(`
    SELECT pp.media_type as format,
           AVG(COALESCE(pm.likes, 0) + COALESCE(pm.comments, 0) + COALESCE(pm.reposts, 0)) as avg_engagement
    FROM published_posts pp
    LEFT JOIN post_metrics pm ON pm.published_post_id = pp.id
    GROUP BY pp.media_type
    ORDER BY avg_engagement DESC
  `).all() as { format: string | null; avg_engagement: number }[];

  const totalRow = db.prepare(`
    SELECT COUNT(*) as total,
           AVG(COALESCE(pm.likes, 0) + COALESCE(pm.comments, 0) + COALESCE(pm.reposts, 0)) as avg_eng
    FROM published_posts pp
    LEFT JOIN post_metrics pm ON pm.published_post_id = pp.id
  `).get() as { total: number; avg_eng: number } | undefined;

  return {
    bestFormats: formatRows.map((r) => r.format || "text"),
    avgEngagement: totalRow?.avg_eng || 0,
    totalPosts: totalRow?.total || 0,
  };
}
