# Copilot Instructions

## Architecture
- FreshBeat is a Deno Fresh app; `dev.ts`/`main.ts` load `$std/dotenv` and boot the server with `fresh.config.ts` + generated manifest in `fresh.gen.ts`.
- UI lives in `routes/` (SSR handlers) plus Preact islands under `islands/`; Tailwind+DaisyUI styles are wired through `fresh.config.ts` and `static/styles.css`.
- Almost all business logic sits in `services/`; HTTP routes are thin adapters that create service instances per request (see `routes/api/telegram/webhook.ts` and `routes/api/go.tsx`).
- Telegram flows rely on `services/telegram/bot/*`: composers (e.g. `StartComposer`) orchestrate Last.fm auth, DB writes, and localization responses.
- External providers get their own service folders (`services/lastfm`, `services/spotify`, `services/ai`, `services/s3`, etc.) so reuse those clients before adding new fetch logic.

## Key Workflows
- Install deps via `deno` only; run `deno task start` for watch mode, `deno task preview` to mimic production, and `deno task build`/`setup:build` for static output.
- Quality gate is `deno task check` (fmt + lint + type-check); formatting is `deno fmt` (note 2-space indent, single quotes, and huge `lineWidth` in `deno.json`).
- Tests live beside services (`*.service.test.ts`) and run with `deno task test`; they often hit live APIs, so ensure required tokens in `.env` before executing.
- Database schema is defined in `services/db/schema.ts` (Drizzle ORM). Use `deno task db:generate` to emit SQL into `drizzle/` and `deno task db:migrate` to apply migrations via drizzle-kit.
- Localization workflow: edit `localization/base/ptBR.json`, then run `deno task setup:loc` (alias of `setup:localization`) to regenerate `languages/auto/*` and pull translations from Crowdin when `CROWDIN_TOKEN` is set.

## Patterns & Conventions
- Configuration is centralized in `config.ts` with a Zod schema; never read raw `Deno.env` elsewhere—import `config` and add new keys there so validation and defaults stay in sync.
- Data access goes through `DBService` (wrapping `drizzle(postgres(...))`). Pass a single `DBService` instance into per-request services (`UsersService`, `KeyvalueService`, `ErrorsService`) to ensure the same connection pool.
- When sending localized Telegram replies, always call `lang(ctxLangCode(ctx), { key, value }, vars)` with Portuguese fallback text so new keys work before translation.
- Errors inside bot composers should be funneled to `ErrorsService.create` and surfaced to users with the `error_with_code` string, matching `StartComposer.error()`.
- Temporary cross-channel state (e.g., Spotify linking) is stored via `KeyvalueService` and consumed through the `/api/go` redirect helper; reuse that mechanism instead of inventing new tables for short-lived tokens.
- Client-side redirects or Telegram WebApp callbacks belong in `islands/Redirect.tsx` or `islands/MiniappCallback.tsx`—reuse those patterns for new flows to avoid duplicating scripts.

## Integrations Cheat Sheet
- Telegram bot webhooks live at `/api/telegram/webhook`; GET sets the webhook unless `config.POLLING_MODE` is true, POST proxies to `TelegramBotService.handle`. Starting the bot in polling mode is done automatically when `POLLING_MODE` is true.
- Last.fm login flow: `/api/lastfm/callback.tsx` encodes Start props via `StartComposer.encodeStartProps`, then redirects back to the bot or sends WebApp data; follow that dance for any new auth provider.
- AI helpers (`services/ai/ai.service.ts`) wrap the `ai` SDK and switch providers (OpenAI/Anthropic/Google) based on `modelId`; add new models by extending `modelIds` instead of branching elsewhere.
- Media storage uses `S3Service` (`@aws-sdk/client-s3`) with `forcePathStyle`; construct it once per workflow and catch errors to rethrow with context as done in `uploadFile`/`downloadFile`/`deleteFile`.
- External audio/streaming services (Last.fm, Spotify, Deezer, SoundCloud, YouTube, ACRCloud, Replicate) already expose typed helpers in their respective folders—prefer importing those over raw fetches so auth and rate-limiting remain consistent.
