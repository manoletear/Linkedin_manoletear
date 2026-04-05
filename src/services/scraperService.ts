import { chromium, Browser } from "playwright";
import { RawNewsItem } from "../types";
import { logger } from "./logger";

export type ScrapingTarget = {
  name: string;
  url: string;
  selectors: {
    articleList: string;
    title: string;
    link: string;
    summary?: string;
    date?: string;
    author?: string;
  };
};

// Hardcoded defaults (used when Supabase is not configured)
export const DEFAULT_TARGETS: ScrapingTarget[] = [
  {
    name: "McKinsey - AI",
    url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights",
    selectors: {
      articleList: "[class*='item'], [class*='card'], article",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='description'], [class*='summary']",
      date: "time, [class*='date']",
    },
  },
  {
    name: "BCG - AI",
    url: "https://www.bcg.com/x/artificial-intelligence/insights",
    selectors: {
      articleList: "[class*='card'], article, [class*='item']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='description']",
      date: "time, [class*='date']",
    },
  },
  {
    name: "Bain - AI",
    url: "https://www.bain.com/insights/topics/artificial-intelligence/",
    selectors: {
      articleList: "[class*='card'], article, [class*='item']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='description']",
      date: "time, [class*='date']",
    },
  },
  {
    name: "Deloitte - AI",
    url: "https://www2.deloitte.com/us/en/pages/consulting/topics/ai-dossier.html",
    selectors: {
      articleList: "[class*='card'], article, [class*='promo']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='description']",
      date: "time, [class*='date']",
    },
  },
  {
    name: "Accenture - AI",
    url: "https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index",
    selectors: {
      articleList: "[class*='card'], article, [class*='item']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='description']",
      date: "time, [class*='date']",
    },
  },
  {
    name: "MIT Sloan - AI",
    url: "https://sloanreview.mit.edu/topic/artificial-intelligence-and-machine-learning/",
    selectors: {
      articleList: "article, [class*='card'], [class*='post']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='excerpt'], [class*='description']",
      date: "time, [class*='date']",
      author: "[class*='author'], [class*='byline']",
    },
  },
  {
    name: "Harvard Business Review - AI",
    url: "https://hbr.org/topic/subject/ai-and-machine-learning",
    selectors: {
      articleList: "article, [class*='stream-item'], [class*='card']",
      title: "h3, h2, [class*='title']",
      link: "a",
      summary: "p, [class*='dek'], [class*='summary']",
      date: "time, [class*='date']",
      author: "[class*='author'], [class*='byline']",
    },
  },
];

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

async function scrapeTarget(target: ScrapingTarget): Promise<RawNewsItem[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  const items: RawNewsItem[] = [];

  try {
    await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const articles = await page.$$(target.selectors.articleList);
    const toProcess = articles.slice(0, 15);

    for (const article of toProcess) {
      try {
        const titleEl = await article.$(target.selectors.title);
        const linkEl = await article.$(target.selectors.link);
        const summaryEl = target.selectors.summary
          ? await article.$(target.selectors.summary)
          : null;
        const dateEl = target.selectors.date
          ? await article.$(target.selectors.date)
          : null;
        const authorEl = target.selectors.author
          ? await article.$(target.selectors.author)
          : null;

        const title = titleEl
          ? (await titleEl.textContent())?.trim()
          : null;
        const href = linkEl
          ? await linkEl.getAttribute("href")
          : null;

        if (!title || !href) continue;

        const fullUrl = href.startsWith("http")
          ? href
          : new URL(href, target.url).toString();

        const summary = summaryEl
          ? (await summaryEl.textContent())?.trim() || ""
          : "";
        const dateStr = dateEl
          ? (await dateEl.getAttribute("datetime")) ||
            (await dateEl.textContent())?.trim() ||
            ""
          : "";
        const author = authorEl
          ? (await authorEl.textContent())?.trim()
          : undefined;

        items.push({
          source: target.name,
          title,
          url: fullUrl,
          summary,
          publishedAt: parseDateSafe(dateStr),
          author,
        });
      } catch {
        // Skip individual article errors
      }
    }

    logger.info(
      { target: target.name, count: items.length },
      "Scraping complete"
    );
  } catch (error) {
    logger.warn(
      { target: target.name, error: (error as Error).message },
      "Scraping failed"
    );
  } finally {
    await context.close();
  }

  return items;
}

function parseDateSafe(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Load targets from Supabase if configured, otherwise use hardcoded defaults.
 */
export async function loadTargets(): Promise<ScrapingTarget[]> {
  try {
    const { env } = await import("../config/env");
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return DEFAULT_TARGETS;
    }

    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase
      .from("scraping_targets")
      .select("*")
      .eq("active", true);

    if (error || !data?.length) {
      logger.info("Using hardcoded scraping targets (Supabase not available or empty)");
      return DEFAULT_TARGETS;
    }

    logger.info(`Loaded ${data.length} scraping targets from Supabase`);
    return data.map((row: any) => ({
      name: row.name,
      url: row.url,
      selectors: row.selectors,
    }));
  } catch {
    return DEFAULT_TARGETS;
  }
}

export async function scrapeTargets(
  targets?: ScrapingTarget[]
): Promise<RawNewsItem[]> {
  const activeTargets = targets || (await loadTargets());
  const allItems: RawNewsItem[] = [];

  for (const target of activeTargets) {
    const items = await scrapeTarget(target);
    allItems.push(...items);
  }

  await closeBrowser();

  logger.info(
    `Scraper: ${allItems.length} items from ${activeTargets.length} targets`
  );
  return allItems;
}

export async function scrapeArticleContent(url: string): Promise<string> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const selectors = [
      "article",
      "[class*='article-body']",
      "[class*='post-content']",
      "[class*='entry-content']",
      "[class*='story-body']",
      "main",
    ];

    for (const selector of selectors) {
      const el = await page.$(selector);
      if (el) {
        const text = await el.textContent();
        if (text && text.trim().length > 200) {
          return text.trim().slice(0, 3000);
        }
      }
    }

    const paragraphs = await page.$$eval("p", (ps) =>
      ps.map((p) => p.textContent?.trim() || "").filter((t) => t.length > 50)
    );

    return paragraphs.join("\n\n").slice(0, 3000);
  } catch (error) {
    logger.warn({ url, error: (error as Error).message }, "Article scrape failed");
    return "";
  } finally {
    await context.close();
  }
}
