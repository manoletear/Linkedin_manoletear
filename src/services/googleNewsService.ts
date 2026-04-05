import Parser from "rss-parser";
import { RawNewsItem } from "../types";
import { logger } from "./logger";

const parser = new Parser();

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search";

export async function fetchGoogleNews(
  query: string,
  language: string = "es",
  country: string = "CL"
): Promise<RawNewsItem[]> {
  const params = new URLSearchParams({
    q: query,
    hl: language,
    gl: country,
    ceid: `${country}:${language}`,
  });

  const url = `${GOOGLE_NEWS_RSS}?${params.toString()}`;

  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => ({
      source: extractSource(item.title || ""),
      title: cleanTitle(item.title || ""),
      url: item.link || "",
      summary: item.contentSnippet || item.content || "",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      tags: item.categories || [],
    }));
  } catch (error) {
    logger.error({ error, query }, "Google News RSS fetch failed");
    return [];
  }
}

export async function fetchGoogleNewsMultiQuery(
  queries: string[],
  language: string = "es",
  country: string = "CL"
): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    queries.map((q) => fetchGoogleNews(q, language, country))
  );

  const items: RawNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  logger.info(`Google News: ${items.length} items from ${queries.length} queries`);
  return items;
}

// Google News titles come as "Title - Source Name"
function extractSource(title: string): string {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "Google News";
}

function cleanTitle(title: string): string {
  const parts = title.split(" - ");
  if (parts.length > 1) {
    return parts.slice(0, -1).join(" - ").trim();
  }
  return title;
}
