import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** Base import restrictions; each layer override repeats them because flat config replaces a rule's options. */
const base = [
  { group: ['**/../../*/**'], message: 'Do not reach into another module with relative paths; use its public API.' },
];

const restrict = (extra) => ({
  'no-restricted-imports': ['error', { patterns: [...base, ...extra] }],
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'next-env.d.ts', 'playwright-report/**']),
  {
    files: ['src/modules/*/domain/**/*.{ts,tsx}'],
    rules: restrict([
      { group: ['react', 'react-dom', 'next', 'next/*', 'zod', '@supabase/*'], message: 'Domain is framework free.' },
      { group: ['@platform/*', '@nav/*', '@composition/*', '@modules/*'], message: 'Domain may use only the shared kernel and lib.' },
      { group: ['../application/*', '../infrastructure/*', '../presentation/*'], message: 'Domain depends on nothing outward.' },
    ]),
  },
  {
    files: ['src/modules/*/application/**/*.{ts,tsx}'],
    rules: restrict([
      { group: ['../infrastructure/*', '../presentation/*', 'react', 'react-dom', 'next', 'next/*'], message: 'Application depends on domain and ports only.' },
    ]),
  },
  {
    files: ['src/modules/*/presentation/**/*.{ts,tsx}'],
    rules: restrict([
      { group: ['../infrastructure/*', '@modules/*/infrastructure*'], message: 'Presentation never imports infrastructure.' },
    ]),
  },
  {
    files: ['src/modules/*/infrastructure/**/*.{ts,tsx}'],
    rules: restrict([
      { group: ['../presentation/*', '@modules/*/presentation*'], message: 'Infrastructure never imports presentation.' },
    ]),
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict([
      { group: ['@modules/*', '@platform/*', '@nav/*', '@composition/*'], message: 'Shared code has no business knowledge.' },
    ]),
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/config/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Read configuration through @shared/config only.',
        },
      ],
    },
  },
]);
