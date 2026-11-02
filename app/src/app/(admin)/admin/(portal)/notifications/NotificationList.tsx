import Link from 'next/link';
import type { NotificationRow } from '@backend/modules/messaging';
import { markAllReadAction } from '../messaging-actions';
import { ActionForm } from '../ActionForm';

const KIND = { info: 'Info', action: 'Action needed', alert: 'Alert' } as const;

export function NotificationList({ rows, unread }: { rows: readonly NotificationRow[]; unread: number }) {
  return (
    <main className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Notifications {unread ? `(${unread} unread)` : ''}</h1>
        {unread ? <ActionForm action={markAllReadAction.bind(null)} submitLabel="Mark all as read" className="grid"><span /></ActionForm> : null}
      </div>
      {rows.length === 0 ? <p className="adm-card text-sm">Nothing yet.</p> : null}
      <ul className="grid gap-3">
        {rows.map((n) => (
          <li key={n.id} className="adm-card grid gap-1" style={n.read ? { opacity: 0.7 } : undefined}>
            <span className="font-medium">{n.link ? <Link href={n.link} className="adm-link">{n.title}</Link> : n.title}</span>
            {n.body ? <span className="text-sm">{n.body}</span> : null}
            <span className="text-xs" style={{ color: 'var(--adm-muted)' }}>{KIND[n.kind]} · {new Date(n.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}{n.read ? '' : ' · unread'}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
