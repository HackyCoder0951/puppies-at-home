import { z } from 'zod';
import type { ToolCall, ToolDefinition, ToolName, ToolResult } from '../domain';
import type { KnowledgeIndex, ToolSet, ToolSettings } from './ports';

const BREEDS = ['maltipoo', 'pomeranian', 'poodle', 'cavapoo', 'shih-tzu'] as const;

const retrievePuppies = z.object({
  breed: z.enum(BREEDS).optional(),
  sex: z.enum(['male', 'female']).optional(),
  origin: z.enum(['local', 'imported']).optional(),
  collection: z.literal('korean-teacup').optional(),
  text: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(8).optional(),
}).strict();
const getPuppy = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,80}$/) }).strict();
const retrieveInfo = z.object({
  query: z.string().min(2).max(200),
  topic: z.enum(['delivery', 'health', 'process', 'visit', 'imports', 'general']).optional(),
  limit: z.number().int().min(1).max(5).default(3),
}).strict();
const getContact = z.object({}).strict();
const draft = z.object({ puppySlug: z.string().regex(/^[a-z0-9-]{1,80}$/).optional(), summary: z.string().min(3).max(400) }).strict();

const SCHEMAS = { retrieve_puppies: retrievePuppies, get_puppy: getPuppy, retrieve_info: retrieveInfo, get_contact_options: getContact, create_enquiry_draft: draft } as const satisfies Record<ToolName, z.ZodType>;

const DESCRIPTIONS: Record<ToolName, string> = {
  retrieve_puppies: 'Find puppies that are available now by breed, sex, origin or collection. Results are the only puppies you may name.',
  get_puppy: 'Get the public facts for one puppy by its slug (also says when a puppy has gone home).',
  retrieve_info: 'Search the FAQs and how-it-works text about delivery, health, visiting, imports and the buying process.',
  get_contact_options: 'Get the business WhatsApp, phone, email and the contact form link for handing the visitor over to the team.',
  create_enquiry_draft: 'Build a pre-filled message and links the visitor can send themselves. It never sends anything.',
};

/** Phone- or email-like text never travels into a draft. */
export const scrubContact = (text: string) => text.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]').replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone]');

export function createToolSet(index: KnowledgeIndex): ToolSet {
  const defs: ToolDefinition[] = (Object.keys(SCHEMAS) as ToolName[]).map((name) => ({ name, description: DESCRIPTIONS[name], inputSchema: z.toJSONSchema(SCHEMAS[name]) as Record<string, unknown> }));

  async function run(call: ToolCall, settings?: ToolSettings): Promise<ToolResult> {
    const fail = (message: string): ToolResult => ({ callId: call.id, ok: false, output: { error: message }, evidenceIds: [] });
    const schema = SCHEMAS[call.name];
    if (!schema) return fail('Unknown tool.');
    const parsed = schema.safeParse(call.input);
    // Invalid input goes back to the model as an error; the tool never runs on guessed values.
    if (!parsed.success) return fail('Invalid tool input.');
    const input = parsed.data as never;
    const contact = index.contact();
    switch (call.name) {
      case 'retrieve_puppies': {
        const i = input as z.infer<typeof retrievePuppies>;
        const { total, hits } = index.puppies({ breed: i.breed, sex: i.sex, origin: i.origin, collection: i.collection, text: i.text }, i.limit ?? settings?.topK ?? 5, settings?.weights);
        return { callId: call.id, ok: true, evidenceIds: hits.map((p) => p.id), output: { total, hits: hits.map((p) => ({ id: p.id, slug: p.slug, name: p.name, breed: p.breed, sex: p.sex, age: p.age, origin: p.origin, reserved: p.reserved, pageUrl: p.pageUrl, hasVideo: p.hasVideo })) } };
      }
      case 'get_puppy': {
        const p = index.puppy((input as z.infer<typeof getPuppy>).slug);
        if (!p) return { callId: call.id, ok: true, evidenceIds: [], output: { found: false } };
        return { callId: call.id, ok: true, evidenceIds: [p.id], output: { found: true, note: p.status === 'gone-home' ? 'This puppy has gone home.' : undefined, puppy: { id: p.id, slug: p.slug, name: p.name, breed: p.breed, sex: p.sex, age: p.age, origin: p.origin, status: p.status, reserved: p.reserved, pageUrl: p.pageUrl, hasVideo: p.hasVideo } } };
      }
      case 'retrieve_info': {
        const i = input as z.infer<typeof retrieveInfo>;
        const hits = index.info(i.query, i.limit, i.topic);
        return { callId: call.id, ok: true, evidenceIds: hits.map((h) => h.id), output: { hits: hits.map((h) => ({ id: h.id, kind: h.kind, title: h.title, text: h.text.slice(0, 600) })) } };
      }
      case 'get_contact_options':
        return { callId: call.id, ok: true, evidenceIds: ['settings'], output: { whatsappUrl: contact.whatsappUrl, contactFormUrl: contact.contactFormUrl, phoneDisplay: contact.phoneDisplay, email: contact.email, address: contact.address } };
      case 'create_enquiry_draft': {
        const i = input as z.infer<typeof draft>;
        const puppy = i.puppySlug ? index.puppy(i.puppySlug) : undefined;
        const message = `Hi TeddyPups! ${puppy ? `I'm interested in ${puppy.hasPersonalName ? puppy.name : `the ${puppy.breed}`} (${puppy.pageUrl}). ` : ''}${scrubContact(i.summary)}`.slice(0, 600);
        return { callId: call.id, ok: true, evidenceIds: ['settings', ...(puppy ? [puppy.id] : [])], output: { message, whatsappLink: `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`, formLink: contact.contactFormUrl } };
      }
    }
  }
  return { definitions: () => defs, run };
}
