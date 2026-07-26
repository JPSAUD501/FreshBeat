# Changelog

Todas as mudanças notáveis do FreshBeat são documentadas aqui, seguindo [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-07-26

Primeira release da **reescrita completa** do FreshBeat: Node.js + monorepo + clean architecture, substituindo a base Deno/Fresh. O bot roda em modo polling; o site é Next.js na Vercel.

### Adicionado

- **Monorepo npm workspaces** — `apps/bot` (grammY, polling), `apps/web` (Next.js), `packages/{config,database,cache,logging,i18n}`
- **Clean architecture no bot** — ports & adapters com DI manual no composition root; composers finos; erros de negócio com chave i18n e `/support_error_{id}` para falhas inesperadas
- **i18n completo em pt-BR, en-US, ja-JP e es-ES** — catálogos tipados com paridade em compile-time, fallback pt-BR inline, descrições de comandos traduzidas por `language_code` (nomes de comandos sempre em inglês)
- **Comandos:** `/start`, `/help`, `/login`, `/forgetme`, `/playingnow` (aliases `/pn`, `/pntrack`), `/pnalbum`, `/pnartist`, `/lyrics`, `/history`, `/brief`
- **Letras** — lrcmux e LRCLIB em paralelo (melhor resultado, preferindo sincronizada), lyrics.ovh como último fallback; paginação e tradução sob demanda via IA
- **IA (OpenRouter + Vercel AI SDK)** — explicação da letra no idioma do usuário, imagem gerada por IA (Replicate) com upload S3 e alt-text acessível; cache de 30 dias
- **Stats Last.fm completos** — scrobbles faixa/álbum/artista, tempo de audição (com estimativa transparente), badge de explícita e popularidade via Spotify/Deezer, histórico com repetições colapsadas, resumo do perfil
- **Site** — landing nos 4 idiomas, `/privacy`, `/terms`, OAuth Last.fm com estado Redis de uso único, dashboard com Telegram Login Widget (conta vinculada, stats, desvínculo, logout)
- **Infra** — Docker Compose (Postgres + Redis + bot), compose completo com o site, Drizzle ORM com migrations, Redis para cache/rate-limit/estado temporário
- **Qualidade** — ESLint strict + Prettier + TypeScript strict, husky/lint-staged/commitlint, CI com gates completos + gitleaks, coverage com threshold 80% (atual: 100% linhas em domain+application), testes de integração agendados
- **Docs** — README, ARCHITECTURE, ADRs (monorepo, i18n, OAuth), guia de i18n, CONTRIBUTING, CODE_OF_CONDUCT

### Removido (tech debt não portado)

- Scraping frágil (Google lyrics, scrape-youtube), estado em memória, sleeps/polling de OAuth, callback data truncado por bytes, segredos em logs, duplicação comando×callback

[0.1.0]: https://github.com/JPSAUD501/FreshBeat/releases/tag/v0.1.0
