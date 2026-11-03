import type { ModelProvider } from '../../application';
import type { ModelEvent, ModelMessage, ModelRequest, ToolName } from '../../domain';

const BREEDS: [RegExp, string][] = [[/maltipoo/i, 'maltipoo'], [/pom(eranian)?\b/i, 'pomeranian'], [/poodle/i, 'poodle'], [/cavapoo/i, 'cavapoo'], [/shih\s?-?tzu/i, 'shih-tzu']];

type Plan = { tool: ToolName; input: Record<string, unknown> } | null;

/** The deterministic "model": rules choose a tool, then a template turns the tool result into an answer. Earlier visitor messages supply a breed for follow-ups. */
function plan(rawText: string, earlier: readonly string[]): Plan {
  const text = rawText.replace(/\[(phone|email)\]/g, ' ');
  const t = text.toLowerCase();
  const slug = /\b([a-z]+(?:-[a-z0-9]+){2,})\b/.exec(t)?.[1];
  if (slug) return { tool: 'get_puppy', input: { slug } };
  if (/\b(whatsapp|phone|call|email|address|contact|talk to|speak to|human|person|team)\b/.test(t)) return { tool: 'get_contact_options', input: {} };
  const breedOf = (x: string) => BREEDS.find(([re]) => re.test(x))?.[1];
  const sex = /\b(boy|boys|male)\b/.test(t) ? 'male' : /\b(girl|girls|female)\b/.test(t) ? 'female' : undefined;
  const origin = /\b(local|dubai|in stock|today)\b/.test(t) ? 'local' : /\b(import|imported|overseas|korea)/.test(t) ? 'imported' : undefined;
  const collection = /korean teacup|teacup/.test(t) ? 'korean-teacup' : undefined;
  const breed = breedOf(text) ?? (sex ? [...earlier].reverse().map(breedOf).find(Boolean) : undefined);
  const search = (extra: Record<string, unknown> = {}) => ({ tool: 'retrieve_puppies' as const, input: { ...(breed ? { breed } : {}), ...(sex ? { sex } : {}), ...(origin ? { origin } : {}), ...(collection ? { collection } : {}), ...extra } });
  if (breed || sex || collection) return search();
  const topic = /deliver|ship|cargo|fly|flight|worldwide/.test(t) ? 'delivery' : /health|vaccin|vet|certificate|guarantee/.test(t) ? 'health' : /visit|showroom|meet/.test(t) ? 'visit' : /import|order|travel/.test(t) ? 'imports' : undefined;
  if (topic || /\b(how|same day|support|after|photos?)\b/.test(t)) return { tool: 'retrieve_info', input: { query: text.slice(0, 200), ...(topic ? { topic } : {}) } };
  if (/\b(puppy|puppies|available|dog|show me|looking for)\b/.test(t)) return search();
  return { tool: 'retrieve_info', input: { query: text.slice(0, 200) } };
}

const word = (n: number, one: string, many: string) => (n === 1 ? one : many);

function compose(result: Extract<ModelMessage, { role: 'tool' }>['result']): string {
  const out = result.output as Record<string, unknown>;
  if (Array.isArray(out.hits) && out.hits.length && 'slug' in (out.hits[0] as object)) {
    const hits = out.hits as { name: string; breed: string; age: string; pageUrl: string }[];
    const total = Number(out.total ?? hits.length);
    return `I found ${total} available ${word(total, 'puppy', 'puppies')} that ${word(total, 'matches', 'match')}. ${hits.map((p) => `${p.name} is a ${p.breed}, ${p.age}, see ${p.pageUrl}.`).join(' ')} Would you like me to put you in touch with the team?`;
  }
  if (Array.isArray(out.hits) && out.hits.length) {
    const hit = out.hits[0] as { text: string };
    return `${hit.text} Would you like the team to help with anything else?`;
  }
  if (typeof out.whatsappUrl === 'string') return `You can reach the team on WhatsApp at ${out.whatsappUrl} or through the contact form at ${String(out.contactFormUrl)}.`;
  if (out.found === true && out.puppy) {
    const p = out.puppy as { name: string; breed: string; age: string; pageUrl: string; status: string };
    return p.status === 'gone-home' ? `${p.name} has gone home to a new family. Would you like to see our available puppies?` : `${p.name} is a ${p.breed}, ${p.age}, see ${p.pageUrl}.`;
  }
  if (out.found === false) return "I couldn't find that puppy. You can ask the team on the contact form at /contact.";
  return "I don't have that information. You can ask the team on the contact form at /contact.";
}

export class ScriptedModelProvider implements ModelProvider {
  private n = 0;

  async *stream(request: ModelRequest): AsyncGenerator<ModelEvent> {
    const lastUser = [...request.messages].map((m, i) => ({ m, i })).reverse().find((x) => x.m.role === 'user');
    const afterUser = request.messages.slice((lastUser?.i ?? -1) + 1);
    const toolResult = [...afterUser].reverse().find((m): m is Extract<ModelMessage, { role: 'tool' }> => m.role === 'tool');
    if (toolResult) {
      for (const piece of compose(toolResult.result).split(/(?<= )/)) yield { type: 'text', delta: piece };
    } else if (request.tools.length && lastUser && lastUser.m.role === 'user') {
      const earlier = request.messages.slice(0, lastUser.i).flatMap((m) => (m.role === 'user' ? [m.text] : []));
      const p = plan(lastUser.m.text, earlier);
      if (p) { this.n += 1; yield { type: 'tool_use', id: `call-${this.n}`, name: p.tool, input: p.input }; }
    } else {
      yield { type: 'text', delta: lastUser && lastUser.m.role === 'user' ? `You said: ${lastUser.m.text}` : 'Hello!' };
    }
    yield { type: 'usage', inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
    yield { type: 'stop', reason: 'end' };
  }
}
