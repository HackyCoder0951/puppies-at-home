/** Previous and next items in a list; both wrap around at the ends (observed on the reference). */
export function neighbours<T>(list: readonly T[], index: number): { prev: T; next: T } | undefined {
  const n = list.length;
  if (n === 0 || index < 0 || index >= n) return undefined;
  return { prev: list[(index - 1 + n) % n] as T, next: list[(index + 1) % n] as T };
}
