import type { KnowledgeIndex } from '../../application';
import { buildBm25, DEFAULT_WEIGHTS, type InfoDoc, type InfoHit, type KnowledgeData, type PuppyDoc, type PuppyQuery, type RankingWeights } from '../../domain';

const slug = (s: string) => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Retrieval over the generated JSON files. Puppy filters follow the website's catalogue semantics (groups combine with AND,
 * a boy-and-girl pair matches both sexes); free text over FAQs and copy is BM25.
 */
export class JsonKnowledgeIndex implements KnowledgeIndex {
  private readonly bySlug: Map<string, PuppyDoc>;
  private readonly puppyText;
  private readonly infoSearch;

  constructor(private readonly data: KnowledgeData) {
    this.bySlug = new Map([...data.puppies, ...data.goneHome].map((p) => [p.slug, p]));
    this.puppyText = buildBm25(data.puppies, (p) => p.text);
    const faqs: InfoDoc[] = data.faqs.map((f) => ({ id: f.id, topic: 'general', title: f.question, text: f.answer }));
    this.infoSearch = buildBm25([...faqs, ...data.info], (d) => `${d.title} ${d.text}`);
  }

  version() { return this.data.version; }
  contact() { return this.data.settings; }
  puppy(slugValue: string) { return this.bySlug.get(slugValue); }
  allNames() { return [...this.bySlug.values()].filter((p) => p.hasPersonalName).map((p) => ({ id: p.id, name: p.name })); }

  puppies(query: PuppyQuery, limit: number, weights: RankingWeights = DEFAULT_WEIGHTS) {
    const text = query.text?.trim() ?? '';
    const hits = new Map(this.puppyText.search(text).map((r) => [r.item.id, r.score]));
    const matches = (p: PuppyDoc) =>
      (!query.breed || p.breeds.map(slug).includes(slug(query.breed))) &&
      (!query.sex || p.sex === query.sex || p.sex === 'male-female') &&
      (!query.origin || p.origin === query.origin) &&
      (!query.collection || p.collections.map(slug).includes(query.collection));
    const filtered = this.data.puppies.filter(matches);
    const scored = filtered.map((p, index) => ({
      p,
      score: weights.filter + weights.bm25 * (hits.get(p.id) ?? 0) + weights.availability * (p.reserved ? 0 : 1) + weights.recency * (1 - index / Math.max(1, filtered.length)),
    }));
    scored.sort((a, b) => b.score - a.score);
    return { total: filtered.length, hits: scored.slice(0, limit).map((s) => s.p) };
  }

  info(query: string, limit: number, topic?: string): InfoHit[] {
    return this.infoSearch.search(query)
      .filter((r) => !topic || r.item.topic === topic || r.item.topic === 'general')
      .slice(0, limit)
      .map(({ item, score }) => ({ id: item.id, kind: item.id.startsWith('faq-') ? 'faq' : 'info', title: item.title, text: item.text, score }));
  }
}
