/** Large numeral used to label scenes and steps, for example "01". */
export function SectionNumber({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="font-[family-name:var(--font-display)] text-6xl font-black text-toffee/60">
      {String(value).padStart(2, '0')}
    </span>
  );
}
