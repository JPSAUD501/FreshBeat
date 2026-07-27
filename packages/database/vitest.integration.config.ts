import { defineConfig } from 'vitest/config'

/**
 * Testes de integração: batem no Postgres de verdade (DATABASE_URL).
 * OPT-IN — só rodam via `npm run test:integration` com a env definida.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30_000,
  },
})
