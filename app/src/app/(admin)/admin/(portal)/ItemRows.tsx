import type { OrderItemRow } from '@backend/modules/commerce';
import { ITEM_ROWS } from './items';

/** Fixed item rows (works without JavaScript). Amounts are shown and entered in AED. */
export function ItemRows({ items = [], first }: { items?: readonly OrderItemRow[]; first?: { description: string; price: string } }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium">Items (leave unused rows empty)</legend>
      {Array.from({ length: ITEM_ROWS }, (_, i) => {
        const item = items[i];
        const seed = !item && i === 0 ? first : undefined;
        return (
          <div key={i} className="grid grid-cols-[1fr_4rem_7rem] gap-2">
            <input name={`desc_${i}`} aria-label={`Item ${i + 1} description`} placeholder="Description" defaultValue={item?.description ?? seed?.description ?? ''} className="adm-input" />
            <input name={`qty_${i}`} aria-label={`Item ${i + 1} quantity`} type="number" min={1} max={99} defaultValue={item?.quantity ?? (seed ? 1 : '')} placeholder="Qty" className="adm-input" />
            <input name={`price_${i}`} aria-label={`Item ${i + 1} price in AED`} inputMode="decimal" placeholder="AED" defaultValue={item ? String(item.unitMinor / 100) : (seed?.price ?? '')} className="adm-input" />
          </div>
        );
      })}
    </fieldset>
  );
}
