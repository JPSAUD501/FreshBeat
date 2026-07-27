# Copilot Instructions

## Architecture

- FreshBeat is an **npm workspaces monorepo**: `apps/bot` (Telegram bot, Node.js 22 + grammY, polling mode), `apps/web` (Next.js site → Vercel), and shared `packages/*` (`config`, `database`, `cache`, `logging`, `i18n`).
- The bot follows **ports & adapters**: `domain/` (entities, errors, port interfaces) → `application/` (pure use cases) → `infrastructure/` (adapters: Drizzle, Redis, Last.fm, Spotify, lyrics providers, AI) → `presentation/` (thin grammY composers + formatters) → `composition/container.ts` (the ONLY place adapters are instantiated).
- Composers never call external APIs — they translate `ctx` ↔ use case and format the reply. Dependencies are constructor-injected against interfaces.
- Business errors extend `AppError` and carry an `i18nKey`; unexpected errors are persisted and surfaced as `/support_error_{id}`.
- The web app has no domain layer: rules live in `apps/web/lib/` (pure, tested functions) and data access reuses the bot's packages (`@freshbeat/database`, `@freshbeat/cache`, `@freshbeat/config`).

## Key Workflows

- Install with `npm install` at the root; run the bot in watch mode with `npm run dev`, the site with `npm run dev --workspace @freshbeat/web`.
- **Quality gate: `npm run verify`** (format check + lint + typecheck + tests) — must be green before committing. Coverage: `npm run test:coverage` (threshold 80% on bot `domain/`+`application/`, currently 100% lines).
- Integration tests (`*.integration.test.ts`) hit real APIs, are opt-in via `npm run test:integration`, and skip when env keys are missing.
- Database: schema in `packages/database/src/schema.ts`; generate SQL with `npm run db:generate`, apply with `npm run db:migrate`.
- Docker: `docker compose up --build` (Postgres + Redis + MinIO + bot, no site) or `docker compose -f docker-compose.all.yml up --build` (adds the site).

## Patterns & Conventions

- **Config**: all env vars are validated with zod in `@freshbeat/config` (fail-fast). Never read `process.env` elsewhere — add keys to the schema. Optional integrations (Spotify, AI, Replicate, S3) are all-or-nothing groups.
- **i18n**: pt-BR (base), en-US, ja-JP, es-ES. Bot messages use `msg({ key, value })` with the pt-BR text inline as fallback; catalog keys are compile-time checked across all 4 locales. Command names are NEVER translated. Translations live in the repo (no Crowdin) — see `docs/i18n.md`.
- **State**: temporary state (OAuth, callback context) goes in Redis via `TempStateStore` (single-use tokens with TTL) — never in memory, never with sleeps. Callback data carries short tokens, never raw data (64-byte limit).
- **Cache**: external API results are cached in Redis with short TTLs via `getOrSet`.
- **Commits**: Conventional Commits enforced by commitlint; husky + lint-staged run eslint/prettier on staged files. Never commit `.env` (gitleaks runs in CI).
- Big architectural decisions are recorded as ADRs in `docs/adr/` — follow the existing format.
