'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createBrowserSupabase } from '@platform/supabase/browser';
import { toast } from './Toaster';

export interface LiveConfig { readonly url: string; readonly anonKey: string; readonly userId: string }

/**
 * The notification bell. Starts from the server-rendered count, then listens for this person's own notification rows over Realtime
 * (the database filters by row-level security, so nobody receives anyone else's). Without a connection it simply stays as rendered.
 */
export function LiveBell({ unread, live }: { unread: number; live?: LiveConfig }) {
  const [count, setCount] = useState(unread);
  const [prevUnread, setPrevUnread] = useState(unread);
  if (unread !== prevUnread) { setPrevUnread(unread); setCount(unread); }   // a fresh server render is the newest truth
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!live) return;
    const client = createBrowserSupabase(live.url, live.anonKey);
    let cancelled = false;
    let channel: ReturnType<typeof client.channel> | undefined;
    const recount = async () => {
      const { count: n, error } = await client.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
      if (!error && n !== null) setCount(n);
    };
    void (async () => {
      // Realtime must carry the staff token before it subscribes, or the database sees an anonymous visitor and delivers nothing.
      const { data } = await client.auth.getSession();
      if (cancelled || !data.session) return;
      await client.realtime.setAuth(data.session.access_token);
      channel = client
        .channel(`bell:${live.userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${live.userId}` }, (payload) => {
          const row = payload.new as { id: string; title?: string };
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);
          if (row.title) toast(row.title);
          void recount();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${live.userId}` }, () => void recount())
        .subscribe();
    })();
    return () => { cancelled = true; if (channel) void client.removeChannel(channel); };
  }, [live]);

  return (
    <Link href="/admin/notifications" className="adm-chip" aria-label={count ? `${count} unread notifications` : 'Notifications'} aria-live="polite">Bell{count ? <span className="adm-count">{count}</span> : null}</Link>
  );
}
