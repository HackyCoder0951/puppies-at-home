import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { SourceFile } from './rules';

export const ROOT = process.cwd();
/** The backend root sits beside app/; both contribute to one logical src tree. */
export const BACKEND = join(ROOT, '..', 'backend');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}


/** All files under src with a TypeScript or TSX extension, as repository-relative paths and sources. */
export function loadSourceFiles(): SourceFile[] {
  const read = (root: string, origin: 'app' | 'backend') =>
    walk(join(root, 'src'))
      .filter((p) => /\.(ts|tsx)$/.test(p))
      .map((p) => ({ path: relative(root, p).split(sep).join('/'), source: readFileSync(p, 'utf8'), origin }));
  return [...read(ROOT, 'app'), ...read(BACKEND, 'backend')];
}

/** All file paths under src (any type), repository-relative. */
export function loadAllPaths(): string[] {
  const logical = (root: string) => walk(join(root, 'src')).map((p) => relative(root, p).split(sep).join('/'));
  return [...logical(ROOT), ...logical(BACKEND)];
}
