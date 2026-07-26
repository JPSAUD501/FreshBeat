// @ts-check
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/drizzle/**',
      // gerado automaticamente pelo Next
      '**/next-env.d.ts',
    ],
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // APIs de cache/serialização usam genéricos de propósito (get<T>) — regra pedante demais para ports
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
    },
  },
  {
    // Configs JS da raiz: sem análise de tipos
    files: ['*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Next.js/React: lint sem análise de tipos (o typecheck roda via tsc no CI)
    files: ['apps/web/**/*.tsx', 'apps/web/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
)
