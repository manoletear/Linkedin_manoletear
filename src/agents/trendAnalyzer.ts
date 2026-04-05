import { differenceInHours } from "date-fns";
import { NormalizedNewsItem, RankedNewsItem, UserContentProfile } from "../types";

const SOURCE_AUTHORITY: Record<string, number> = {
  reuters: 9,
  bloomberg: 9,
  "the wall street journal": 9,
  "financial times": 9,
  techcrunch: 8,
  wired: 8,
  "the verge": 7,
  "ars technica": 7,
  "mit technology review": 8,
};

function recencyScore(publishedAt: string): number {
  const hours = differenceInHours(new Date(), new Date(publishedAt));
  if (hours < 6) return 10;
  if (hours < 12) return 8;
  if (hours < 24) return 6;
  if (hours < 48) return 4;
  if (hours < 72) return 2;
  return 1;
}

function sourceAuthority(source: string): number {
  const key = source.toLowerCase();
  for (const [name, score] of Object.entries(SOURCE_AUTHORITY)) {
    if (key.includes(name)) return score;
  }
  return 5;
}

function relevanceScore(
  item: NormalizedNewsItem,
  profile: UserContentProfile
): number {
  const text = item.canonicalText.toLowerCase();
  const matches = [...profile.sectors, ...profile.keywords].filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  return Math.min(10, matches.length * 3);
}

function noveltyScore(
  item: NormalizedNewsItem,
  allItems: NormalizedNewsItem[]
): number {
  const titleWords = new Set(item.title.toLowerCase().split(/\s+/));
  let uniqueWords = 0;

  for (const word of titleWords) {
    if (word.length < 4) continue;
    const appearsElsewhere = allItems.some(
      (other) =>
        other.id !== item.id &&
        other.title.toLowerCase().includes(word)
    );
    if (!appearsElsewhere) uniqueWords++;
  }

  return Math.min(10, uniqueWords * 2);
}

export function rank(
  items: NormalizedNewsItem[],
  profile: UserContentProfile
): RankedNewsItem[] {
  const ranked = items.map((item) => {
    const rec = recencyScore(item.publishedAt);
    const auth = sourceAuthority(item.source);
    const rel = relevanceScore(item, profile);
    const nov = noveltyScore(item, items);
    const disc = Math.round((rel + nov + auth) / 3);

    return {
      ...item,
      recencyScore: rec,
      sourceAuthorityScore: auth,
      relevanceScore: rel,
      noveltyScore: nov,
      discussionPotentialScore: disc,
      finalScore: rec * 0.2 + auth * 0.15 + rel * 0.3 + nov * 0.15 + disc * 0.2,
    };
  });

  return ranked.sort((a, b) => b.finalScore - a.finalScore);
}
