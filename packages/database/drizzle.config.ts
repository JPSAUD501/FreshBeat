import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // drizzle-kit lê direto do ambiente (nunca hardcode credenciais aqui)
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
})
