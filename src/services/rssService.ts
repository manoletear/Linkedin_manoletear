import Parser from "rss-parser";
import { RawNewsItem } from "../types";

const parser = new Parser();

export async function fetchRSSFeed(feedUrl: string): Promise<RawNewsItem[]> {
  const feed = await parser.parseURL(feedUrl);
  return (feed.items || []).map((item) => ({
    source: feed.title || feedUrl,
    title: item.title || "",
    url: item.link || "",
    summary: item.contentSnippet || item.content || "",
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    author: item.creator || item.author || undefined,
    tags: item.categories || [],
  }));
}

export async function fetchMultipleFeeds(
  feedUrls: string[]
): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    feedUrls.map((url) => fetchRSSFeed(url))
  );

  const items: RawNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }
  return items;
}
