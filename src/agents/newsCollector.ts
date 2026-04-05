import { RawNewsItem, UserContentProfile } from "../types";
import { fetchMultipleFeeds } from "../services/rssService";
import { fetchGoogleNewsMultiQuery } from "../services/googleNewsService";
import { scrapeTargets, DEFAULT_TARGETS } from "../services/scraperService";
import { getRssFeeds } from "../config/env";
import { logger } from "../services/logger";

export async function collect(
  profile: UserContentProfile
): Promise<RawNewsItem[]> {
  const queries = buildQueries(profile);
  const rssFeeds = getRssFeeds();

  const [rssItems, googleNewsItems, scrapedItems] = await Promise.allSettled([
    rssFeeds.length > 0
      ? fetchMultipleFeeds(rssFeeds)
      : Promise.resolve([]),
    fetchGoogleNewsMultiQuery(queries),
    scrapeTargets(DEFAULT_TARGETS),
  ]);

  const items: RawNewsItem[] = [];

  if (rssItems.status === "fulfilled") {
    items.push(...rssItems.value);
    logger.info(`RSS: ${rssItems.value.length} items`);
  } else {
    logger.warn("RSS fetch failed");
  }

  if (googleNewsItems.status === "fulfilled") {
    items.push(...googleNewsItems.value);
    logger.info(`Google News: ${googleNewsItems.value.length} items`);
  } else {
    logger.warn("Google News fetch failed");
  }

  if (scrapedItems.status === "fulfilled") {
    items.push(...scrapedItems.value);
    logger.info(`Scraper: ${scrapedItems.value.length} items`);
  } else {
    logger.warn("Scraper failed");
  }

  logger.info(`Total raw items: ${items.length}`);
  return items;
}

function buildQueries(profile: UserContentProfile): string[] {
  const base = [...profile.sectors, ...profile.keywords];

  // Generate specific queries combining sectors with keywords
  const queries: string[] = [];

  // Main combined query
  queries.push(base.join(" "));

  // Per-sector queries with AI focus
  for (const sector of profile.sectors) {
    queries.push(`${sector} inteligencia artificial`);
    queries.push(`${sector} AI trends 2025`);
  }

  // Keep unique and limit
  return [...new Set(queries)].slice(0, 5);
}
