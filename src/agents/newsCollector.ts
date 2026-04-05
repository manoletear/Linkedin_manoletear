import { RawNewsItem, UserContentProfile } from "../types";
import { fetchMultipleFeeds } from "../services/rssService";
import { fetchNewsAPI } from "../services/newsApiService";
import { getRssFeeds } from "../config/env";
import { logger } from "../services/logger";

export async function collect(
  profile: UserContentProfile
): Promise<RawNewsItem[]> {
  const query = [...profile.sectors, ...profile.keywords].join(" OR ");

  const [rssItems, newsApiItems] = await Promise.allSettled([
    fetchMultipleFeeds(getRssFeeds()),
    fetchNewsAPI(query),
  ]);

  const items: RawNewsItem[] = [];

  if (rssItems.status === "fulfilled") {
    items.push(...rssItems.value);
    logger.info(`RSS: ${rssItems.value.length} items collected`);
  } else {
    logger.warn("RSS fetch failed");
  }

  if (newsApiItems.status === "fulfilled") {
    items.push(...newsApiItems.value);
    logger.info(`NewsAPI: ${newsApiItems.value.length} items collected`);
  } else {
    logger.warn("NewsAPI fetch failed");
  }

  logger.info(`Total raw items: ${items.length}`);
  return items;
}
