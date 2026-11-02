import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: { alias: { '@backend': r('./src'), '@platform': r('./src/platform'), 'server-only': r('./test-support/server-only.ts') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
