import { supabase } from "../lib/supabase";
import { logger } from "../services/logger";

export async function saveNewsItem(item: {
  source: string;
  title: string;
  url: string;
  summary?: string;
  publishedAt?: string;
  canonicalText?: string;
}) {
  const { data, error } = await supabase
    .from("news_items")
    .upsert(
      {
        source: item.source,
        title: item.title,
        url: item.url,
        summary: item.summary || null,
        published_at: item.publishedAt || null,
        canonical_text: item.canonicalText || null,
        status: "new",
      },
      { onConflict: "url" }
    )
    .select()
    .single();

  if (error) {
    logger.warn({ error: error.message, url: item.url }, "Failed to save news item");
    return null;
  }
  return data;
}

export async function saveContentOption(option: {
  newsItemId: string;
  angleTitle: string;
  thesis: string;
  format: string;
  score?: number;
}) {
  const { data, error } = await supabase
    .from("content_options")
    .insert({
      news_item_id: option.newsItemId,
      angle_title: option.angleTitle,
      thesis: option.thesis,
      format: option.format,
      score: option.score || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveDraft(draft: {
  contentOptionId: string;
  variant: number;
  fullText: string;
  score?: number;
}) {
  const { data, error } = await supabase
    .from("drafts")
    .insert({
      content_option_id: draft.contentOptionId,
      variant: draft.variant,
      full_text: draft.fullText,
      score: draft.score || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markDraftSelected(draftId: string) {
  const { error } = await supabase
    .from("drafts")
    .update({ selected: true })
    .eq("id", draftId);

  if (error) throw error;
}

export async function savePublishedPost(record: {
  draftId: string;
  linkedinPostId?: string;
  mediaType?: string;
  mediaUrl?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("published_posts")
    .insert({
      draft_id: record.draftId,
      linkedin_post_id: record.linkedinPostId || null,
      media_type: record.mediaType || null,
      media_url: record.mediaUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function savePostMetrics(
  publishedPostId: string,
  metrics: { impressions: number; likes: number; comments: number; reposts: number }
) {
  const { error } = await supabase.from("post_metrics").insert({
    published_post_id: publishedPostId,
    impressions: metrics.impressions,
    likes: metrics.likes,
    comments: metrics.comments,
    reposts: metrics.reposts,
  });

  if (error) throw error;
}

export async function saveMemoryChunk(chunk: {
  kind: string;
  refId?: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("memory_chunks").insert({
    kind: chunk.kind,
    ref_id: chunk.refId || null,
    content: chunk.content,
    embedding: chunk.embedding || null,
    metadata: chunk.metadata || {},
  });

  if (error) throw error;
}

export async function searchMemory(
  embedding: number[],
  limit: number = 5
): Promise<{ id: string; content: string; kind: string; metadata: Record<string, unknown> }[]> {
  const { data, error } = await supabase.rpc("match_memory_chunks", {
    query_embedding: embedding,
    match_count: limit,
  });

  if (error) {
    logger.warn({ error: error.message }, "Memory search failed, falling back to empty");
    return [];
  }
  return data || [];
}

export async function getHistoricalPerformance(limit: number = 50) {
  const { data, error } = await supabase
    .from("published_posts")
    .select(`
      *,
      draft:drafts(*),
      metrics:post_metrics(*)
    `)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTopPatterns() {
  const posts = await getHistoricalPerformance(100);

  const byFormat: Record<string, number[]> = {};
  for (const post of posts) {
    const format = post.media_type || "text";
    const engagement = (post.metrics || []).reduce(
      (sum: number, m: { likes: number; comments: number; reposts: number }) =>
        sum + (m.likes || 0) + (m.comments || 0) + (m.reposts || 0),
      0
    );
    if (!byFormat[format]) byFormat[format] = [];
    byFormat[format].push(engagement);
  }

  const bestFormats = Object.entries(byFormat)
    .map(([format, values]) => ({
      format,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .map((r) => r.format);

  const totalEngagement = posts.reduce((sum, post) => {
    const eng = (post.metrics || []).reduce(
      (s: number, m: { likes: number; comments: number; reposts: number }) =>
        s + (m.likes || 0) + (m.comments || 0) + (m.reposts || 0),
      0
    );
    return sum + eng;
  }, 0);

  return {
    bestFormats,
    avgEngagement: posts.length ? totalEngagement / posts.length : 0,
    totalPosts: posts.length,
  };
}
