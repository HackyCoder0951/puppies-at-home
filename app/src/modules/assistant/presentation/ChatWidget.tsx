'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { parseSse } from '../application/sse';
import type { ChatEvent, PuppyCard } from '../domain';
import './assistant.css';

interface Bubble {
  readonly id: number;
  readonly role: 'user' | 'assistant';
  messageId?: string;
  text: string;
  cards: PuppyCard[];
  handover?: { whatsappUrl: string; contactFormUrl: string };
  rated?: 'up' | 'down';
}

const GREETING = "Hi! I'm Teddy's helper, an AI assistant. I can help you find puppies and answer questions about how buying one works. For prices and bookings, the team is on WhatsApp.";
const ERRORS: Record<string, string> = {
  'rate-limited': "You're sending messages quickly. Please wait a moment and try again.",
  'too-long': 'That message is a little long. Could you shorten it?',
  invalid: 'Please type a message first.',
  unavailable: "I'm having trouble right now. You can reach the team on WhatsApp or the contact form.",
  busy: "I've answered a lot of questions today and need a rest. The team is happy to help on WhatsApp or the contact form.",
  'unknown-conversation': 'Let me start fresh. Please ask again.',
};
const WHATSAPP = 'https://wa.me/971541676733';
const STORE = 'tp-assistant-chat';
interface Saved { conversationId?: string; bubbles?: Bubble[]; next?: number }

/** The chat lives in this tab's session storage only (gone when the tab closes), so it survives page changes on the site. */
function readSaved(): Saved | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(STORE) ?? 'null') as Saved | null; } catch { return null; }
}
const greeting = (): Bubble => ({ id: 0, role: 'assistant', text: GREETING, cards: [], handover: { whatsappUrl: WHATSAPP, contactFormUrl: '/contact' } });

/** The public chat widget: a launcher and a panel. Never opens by itself (decision D20). */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [saved] = useState(readSaved);
  const [bubbles, setBubbles] = useState<Bubble[]>(() => (saved?.bubbles?.length ? saved.bubbles : [greeting()]));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const conversation = useRef<string | undefined>(saved?.conversationId);
  const next = useRef(saved?.next ?? 1);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (busy) return;
    try { if (bubbles.length > 1) sessionStorage.setItem(STORE, JSON.stringify({ conversationId: conversation.current, bubbles, next: next.current })); } catch { /* ignore */ }
  }, [bubbles, busy]);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [bubbles]);

  const close = useCallback(() => { setOpen(false); setTimeout(() => launcher.current?.focus(), 0); }, []);
  // Escape closes from anywhere while the panel is open (focus may sit on a button that has just been disabled).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const patchLast = (fn: (b: Bubble) => void) => setBubbles((list) => { const copy = list.map((b) => ({ ...b, cards: [...b.cards] })); const last = copy[copy.length - 1]; if (last) fn(last); return copy; });

  async function send(text: string, retried = false): Promise<void> {
    const reply: Bubble = { id: next.current++, role: 'assistant', text: '', cards: [] };
    setBubbles((list) => [...list, ...(retried ? [] : [{ id: next.current++, role: 'user' as const, text, cards: [] }]), reply]);
    setBusy(true);
    try {
      const response = await fetch('/api/assistant/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(conversation.current ? { conversationId: conversation.current } : {}), message: text }) });
      if (!response.ok || !response.body) throw new Error('unavailable');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let rest = '';
      for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
        const parsed = parseSse(rest + decoder.decode(chunk.value, { stream: true }));
        rest = parsed.rest;
        for (const event of parsed.events) {
          if (event.type === 'error' && event.code === 'unknown-conversation' && !retried) { conversation.current = undefined; setBubbles((l) => l.slice(0, -1)); return send(text, true); }
          apply(event);
        }
      }
    } catch {
      patchLast((b) => { b.text = ERRORS.unavailable ?? ''; b.handover = { whatsappUrl: WHATSAPP, contactFormUrl: '/contact' }; });
    } finally {
      setBusy(false);
    }
  }

  function apply(event: ChatEvent) {
    if (event.type === 'meta') conversation.current = event.conversationId;
    else if (event.type === 'done') { if (event.messageId) patchLast((b) => { b.messageId = event.messageId; }); }
    else if (event.type === 'delta') patchLast((b) => { b.text += event.text; });
    else if (event.type === 'card') patchLast((b) => { b.cards.push(event.puppy); });
    else if (event.type === 'handover') patchLast((b) => { b.handover = { whatsappUrl: event.whatsappUrl, contactFormUrl: event.contactFormUrl }; });
    else if (event.type === 'error') patchLast((b) => { b.text = ERRORS[event.code] ?? ERRORS.unavailable ?? ''; if (event.code === 'busy' || event.code === 'unavailable') b.handover = { whatsappUrl: WHATSAPP, contactFormUrl: '/contact' }; });
  }

  /** Ratings and clicks carry only ids and a kind, never text. Best effort: a failure is ignored. */
  function report(messageId: string | undefined, kind: 'up' | 'down' | 'link' | 'handover') {
    if (!messageId || !conversation.current) return;
    void fetch('/api/assistant/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: conversation.current, messageId, kind }), keepalive: true }).catch(() => undefined);
  }

  /** Deletes the chat here and on the server (text and records), then starts again. */
  function forget() {
    const id = conversation.current;
    if (id) void fetch('/api/assistant/forget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: id }), keepalive: true }).catch(() => undefined);
    conversation.current = undefined;
    next.current = 1;
    try { sessionStorage.removeItem(STORE); } catch { /* ignore */ }
    setBubbles([greeting()]);
    input.current?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    void send(text);
  }

  if (!open) {
    return <button ref={launcher} type="button" className="tp-ast-launcher" aria-expanded="false" aria-controls="tp-ast-panel" onClick={() => setOpen(true)}>Ask Teddy&apos;s helper</button>;
  }
  return (
    <section id="tp-ast-panel" className="tp-ast-panel" role="dialog" aria-label="Chat with Teddy's helper">
      <div className="tp-ast-head">
        <h2>Teddy&apos;s helper (AI)</h2>
        <button type="button" className="tp-ast-close" aria-label="Close chat" onClick={close}>×</button>
      </div>
      <div ref={log} className="tp-ast-log" role="log" aria-live="polite" aria-label="Conversation" tabIndex={0}>
        {bubbles.map((b) => (
          <div key={b.id} style={{ display: 'contents' }}>
            {b.text || b.role === 'user' ? <p className="tp-ast-msg" data-role={b.role}>{b.text}</p> : <p className="tp-ast-msg" data-role="assistant" aria-busy="true">…</p>}
            {b.cards.length ? (
              <div className="tp-ast-cards">
                {b.cards.map((c) => (
                  <a key={c.slug} className="tp-ast-card" href={c.pageUrl} onClick={() => report(b.messageId, 'link')}><strong>{c.name}</strong>{c.name === c.breed ? c.age : `${c.breed}, ${c.age}`}{c.reserved ? ' (reserved)' : ''}</a>
                ))}
              </div>
            ) : null}
            {b.handover ? (
              <div className="tp-ast-handover">
                <a href={b.handover.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => report(b.messageId, 'handover')}>WhatsApp the team</a>
                <a href={b.handover.contactFormUrl} onClick={() => report(b.messageId, 'handover')}>Contact form</a>
              </div>
            ) : null}
            {b.role === 'assistant' && b.id !== 0 && b.text ? (
              <div className="tp-ast-feedback" role="group" aria-label="Was this helpful?">
                {b.rated ? <span>Thanks for the feedback.</span> : (<>
                  <button type="button" aria-label="Helpful" onClick={() => { report(b.messageId, 'up'); setBubbles((l) => l.map((x) => (x.id === b.id ? { ...x, rated: 'up' } : x))); }}>👍</button>
                  <button type="button" aria-label="Not helpful" onClick={() => { report(b.messageId, 'down'); setBubbles((l) => l.map((x) => (x.id === b.id ? { ...x, rated: 'down' } : x))); }}>👎</button>
                </>)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="tp-ast-note">AI answers can be wrong. Please do not share personal details here. Chats are kept for 30 days to improve the service. <a href="/privacy">Privacy</a> · <button type="button" className="tp-ast-link" onClick={forget}>Delete this chat</button></p>
      <form className="tp-ast-form" onSubmit={submit}>
        <label htmlFor="tp-ast-input" className="sr-only">Your message</label>
        <textarea id="tp-ast-input" ref={input} rows={1} maxLength={500} value={draft} placeholder="Ask about our puppies" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        <button type="submit" disabled={busy || !draft.trim()}>Send</button>
      </form>
    </section>
  );
}
