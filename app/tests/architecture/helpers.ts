import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { SourceFile } from './rules';

export const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const toPosix = (p: string) => relative(ROOT, p).split(sep).join('/');

/** All files under src with a TypeScript or TSX extension, as repository-relative paths and sources. */
export function loadSourceFiles(): SourceFile[] {
  return walk(join(ROOT, 'src'))
    .filter((p) => /\.(ts|tsx)$/.test(p))
    .map((p) => ({ path: toPosix(p), source: readFileSync(p, 'utf8') }));
}

/** All file paths under src (any type), repository-relative. */
export function loadAllPaths(): string[] {
  return walk(join(ROOT, 'src')).map(toPosix);
}
