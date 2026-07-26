import { defineConfig } from 'vitest/config'

/**
 * Testes de integração: batem em APIs reais e/ou banco de verdade.
 * OPT-IN — só rodam via `npm run test:integration` com as envs
 * correspondentes definidas. Cada teste pula (skip) quando a env falta.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30_000,
  },
})
