import { defineConfig, globalIgnores } from 'eslint/config';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextTs,
  globalIgnores(['node_modules/**', 'supabase/**', 'src/platform/supabase/database.types.ts']),
  {
    files: ['src/**/*.ts'],
    ignores: ['src/config/**', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "MemberExpression[object.name='process'][property.name='env']", message: 'Read configuration through @backend/config only.' },
      ],
    },
  },
]);
