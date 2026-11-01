import { paths } from '@nav';
import { Chip } from '@shared/ui';
import { isSelected, toggleFilter, type FacetOption, type FilterGroup, type PuppyFilter } from '../domain';

interface Facets {
  where: FacetOption[];
  breeds: FacetOption[];
  sexes: FacetOption[];
}

/** Query for the nav builder from a domain filter (slug values stay as they are in the URL). */
export const hrefFor = (f: PuppyFilter) =>
  paths.puppies({ breed: f.breeds, sex: f.sexes, origin: f.origin, collection: f.collections });

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="w-28 font-[family-name:var(--font-hand)] text-lg text-toffee-ink">{title}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export function FilterPad({ facets, filter }: { facets: Facets; filter: PuppyFilter }) {
  const chip = (group: FilterGroup, o: FacetOption) => (
    <Chip key={`${group}-${o.value}`} selected={isSelected(filter, group, o.value)} href={hrefFor(toggleFilter(filter, group, o.value))}>
      {o.label}
    </Chip>
  );
  const everywhere = !filter.origin && !filter.collections?.length;
  return (
    <section aria-label="Filter puppies" className="relative flex flex-col gap-4 rounded-(--radius-card) border-[3px] border-cocoa bg-milk p-6 shadow-(--shadow-card)">
      <Row title="where">
        <Chip selected={everywhere} href={hrefFor({ ...filter, origin: undefined, collections: [] })}>Everywhere</Chip>
        {chip('origin', facets.where[0] as FacetOption)}
        {chip('collections', facets.where[1] as FacetOption)}
      </Row>
      <Row title="breed">{facets.breeds.map((b) => chip('breeds', b))}</Row>
      <Row title="boy or girl">{facets.sexes.map((s) => chip('sexes', s))}</Row>
    </section>
  );
}
