import axios from "axios";
import { RawNewsItem } from "../types";
import { env } from "../config/env";

const BASE_URL = "https://newsapi.org/v2";

export async function fetchNewsAPI(
  query: string,
  language: string = "es"
): Promise<RawNewsItem[]> {
  if (!env.NEWS_API_KEY) {
    return [];
  }

  const response = await axios.get(`${BASE_URL}/everything`, {
    params: {
      q: query,
      language,
      sortBy: "publishedAt",
      pageSize: 20,
    },
    headers: {
      "X-Api-Key": env.NEWS_API_KEY,
    },
  });

  const articles = response.data.articles || [];
  return articles.map(
    (article: {
      source?: { name?: string };
      title?: string;
      url?: string;
      description?: string;
      publishedAt?: string;
      author?: string;
      urlToImage?: string;
      content?: string;
    }) => ({
      source: article.source?.name || "NewsAPI",
      title: article.title || "",
      url: article.url || "",
      summary: article.description || "",
      publishedAt: article.publishedAt || new Date().toISOString(),
      author: article.author || undefined,
      imageUrl: article.urlToImage || undefined,
      rawText: article.content || undefined,
    })
  );
}
