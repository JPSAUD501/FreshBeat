import { defineConfig } from 'drizzle-kit'
import { config } from './config.ts'

export default defineConfig({
  out: './drizzle',
  schema: './services/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL!,
  },
})
