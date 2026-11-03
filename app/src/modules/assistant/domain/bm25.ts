const STOP = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'the', 'to', 'we', 'what', 'you', 'your', 'with', 'about', 'will', 'be', 'have', 'get']);

/** Lower-case words without stop words, with a light plural strip so "puppies" meets "puppy". */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w)).map((w) => (w.length > 4 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

export interface Bm25Index<T> { search(query: string): { item: T; score: number }[] }

/** Okapi BM25 over a small in-memory corpus (k1 1.5, b 0.75). Deterministic, no network, no embeddings (decision D33). */
export function buildBm25<T>(items: readonly T[], textOf: (item: T) => string): Bm25Index<T> {
  const docs = items.map((item) => ({ item, terms: tokenize(textOf(item)) }));
  const avg = docs.reduce((n, d) => n + d.terms.length, 0) / Math.max(1, docs.length);
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d.terms)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.5;
  const b = 0.75;
  return {
    search(query) {
      const q = [...new Set(tokenize(query))];
      return docs
        .map(({ item, terms }) => {
          let score = 0;
          for (const t of q) {
            const f = terms.filter((x) => x === t).length;
            if (!f) continue;
            const n = df.get(t) ?? 0;
            const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
            score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * terms.length) / avg));
          }
          return { item, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, c) => c.score - a.score);
    },
  };
}
