import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@modules': r('./src/modules'),
      '@shared': r('./src/shared'),
      '@backend': r('../backend/src'),
      '@platform': r('../backend/src/platform'),
      '@nav': r('./src/navigation'),
      '@composition': r('./src/composition'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'docs/**'],
    // The opt-in integration tests share one database (and its outbox), so they run one file at a time.
    fileParallelism: !process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
