import Link from 'next/link';
import { formatMoney, nextOrderStatuses, ORDER_STATUS_LABEL, type OrderRow, type OrderStatus } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { Board, Badge } from '@shared/ui/admin';
import { ActionForm } from '../ActionForm';
import { orderStatusAction } from '../commerce-actions';
import { ORDER_TONE } from './orderTone';

const STAGES: OrderStatus[] = ['new', 'confirmed', 'deposit_paid', 'preparing', 'in_transit', 'delivered'];

/** Open orders by stage. Each card has one button to advance it; the database still validates every move. */
export function OrderBoard({ rows }: { rows: readonly OrderRow[] }) {
  return (
    <Board
      label="Orders by stage"
      columns={STAGES.map((stage) => {
        const here = rows.filter((o) => o.status === stage);
        return {
          id: stage, title: ORDER_STATUS_LABEL[stage], count: here.length,
          children: here.map((o) => {
            const next = nextOrderStatuses(o.status, o.type).find((s) => s !== 'cancelled');
            return (
              <article key={o.id} className="adm-tile" aria-label={`Order ${o.number}`}>
                <Link href={adminPaths.order(o.id)} className="adm-link font-semibold">{o.number}</Link>
                <span>{o.customerName}</span>
                <span className="adm-muted text-xs">{o.puppyLabel ?? 'No puppy'} · {o.type === 'local' ? 'Local' : 'Imported'}</span>
                <span className="num font-semibold" style={{ textAlign: 'left' }}>{formatMoney(o.totalMinor, o.currency)}</span>
                <Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
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
  );
}
