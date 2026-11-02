import Link from 'next/link';
import { formatMoney, nextOrderStatuses, ORDER_STATUS_LABEL, type OrderRow, type OrderStatus } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { Board, Badge, BoardDnd, Drawer } from '@shared/ui/admin';
import { ActionForm } from '../ActionForm';
import { moveOrderAction, orderStatusAction } from '../commerce-actions';
import { ORDER_TONE } from './orderTone';

const STAGES: OrderStatus[] = ['new', 'confirmed', 'deposit_paid', 'preparing', 'in_transit', 'delivered'];

/** Open orders by stage. Each card has one button to advance it; the database still validates every move. */
export function OrderBoard({ rows }: { rows: readonly OrderRow[] }) {
  return (
    <BoardDnd move={moveOrderAction}>
    <Board
      label="Orders by stage"
      columns={STAGES.map((stage) => {
        const here = rows.filter((o) => o.status === stage);
        return {
          id: stage, title: ORDER_STATUS_LABEL[stage], count: here.length,
          children: here.map((o) => {
            const next = nextOrderStatuses(o.status, o.type).find((s) => s !== 'cancelled');
            return (
              <article key={o.id} className="adm-tile" aria-label={`Order ${o.number}`} data-card={o.id} draggable>
                <Link href={adminPaths.order(o.id)} className="adm-link font-semibold">{o.number}</Link>
                <span>{o.customerName}</span>
                <span className="adm-muted text-xs">{o.puppyLabel ?? 'No puppy'} · {o.type === 'local' ? 'Local' : 'Imported'}</span>
                <span className="num font-semibold" style={{ textAlign: 'left' }}>{formatMoney(o.totalMinor, o.currency)}</span>
                <Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                <Drawer label="Quick view" title={`${o.number} · ${o.customerName}`}>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="adm-muted">Status</dt><dd><Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></dd></div>
                    <div><dt className="adm-muted">Type</dt><dd>{o.type === 'local' ? 'Local' : 'Imported'}</dd></div>
                    <div><dt className="adm-muted">Puppy</dt><dd>{o.puppyLabel ?? '—'}</dd></div>
                    <div><dt className="adm-muted">Items (before VAT)</dt><dd className="num" style={{ textAlign: 'left' }}>{formatMoney(o.totalMinor, o.currency)}</dd></div>
                    <div><dt className="adm-muted">Paid</dt><dd className="num" style={{ textAlign: 'left' }}>{formatMoney(o.paidMinor, o.currency)}</dd></div>
                    <div><dt className="adm-muted">Created</dt><dd>{new Date(o.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</dd></div>
                  </dl>
                  <Link href={adminPaths.order(o.id)} className="adm-btn justify-self-start">Open the order</Link>
                </Drawer>
                {next ? (
                  <ActionForm action={orderStatusAction.bind(null, o.id)} submitLabel={`Move to ${ORDER_STATUS_LABEL[next]}`} className="grid gap-1">
                    <input type="hidden" name="to" value={next} />
                  </ActionForm>
                ) : null}
              </article>
            );
          }),
        };
      })}
    />
    </BoardDnd>
  );
}
