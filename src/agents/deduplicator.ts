import { NormalizedNewsItem } from "../types";

function similarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.length / union.size;
}

function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function clusterDuplicates(
  items: NormalizedNewsItem[]
): NormalizedNewsItem[][] {
  const used = new Set<string>();
  const clusters: NormalizedNewsItem[][] = [];

  for (const item of items) {
    if (used.has(item.id)) continue;

    const cluster = [item];
    used.add(item.id);

    for (const other of items) {
      if (used.has(other.id)) continue;
      if (
        sameDay(item.publishedAt, other.publishedAt) &&
        similarity(item.canonicalText, other.canonicalText) > 0.5
      ) {
        cluster.push(other);
        used.add(other.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

export function selectCanonical(
  cluster: NormalizedNewsItem[]
): NormalizedNewsItem {
  return cluster.reduce((best, item) =>
    item.canonicalText.length > best.canonicalText.length ? item : best
  );
}

export function deduplicate(items: NormalizedNewsItem[]): NormalizedNewsItem[] {
  const clusters = clusterDuplicates(items);
  return clusters.map(selectCanonical);
}
