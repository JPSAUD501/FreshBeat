# ADR 0001: Monorepo Node.js com clean architecture

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

O FreshBeat nasceu como app Deno Fresh (SSR) com o bot de Telegram acoplado ao servidor web, DI manual inconsistente, regras de negócio dentro dos composers e testes que batiam em APIs reais. O projeto precisa crescer (letras, IA, stats Last.fm, site completo) como opensource, com gates de qualidade.

## Decisão

1. **Migrar de Deno para Node.js 22 + npm**, com monorepo de workspaces: `apps/bot`, `apps/web` e `packages/*` compartilhados.
2. **Bot em modo polling** (não webhook), rodando em Docker Compose com Postgres e Redis. O polling remove a necessidade de endpoint público e simplifica o self-hosting.
3. **Site separado em Next.js**, deploy na Vercel, fora do compose principal (um `docker-compose.all.yml` sobe tudo para desenvolvimento local).
4. **Clean architecture (ports & adapters)** no bot: domain (entidades + ports), application (use cases), infrastructure (adapters), presentation (composers finos), composition (DI manual).
5. **DI manual via composition root** em vez de framework de DI (tsyringe/inversify): zero mágica, dependências explícitas e fáceis de mockar.
6. **Drizzle ORM** sobre Postgres; **Redis** para cache, rate limit e estado temporário.
7. **Vitest** para testes unitários mockados (gate de coverage) + integração opt-in.

## Consequências

- Positivas: fronteiras claras, testes rápidos e determinísticos, onboarding simples para contribuidores, deploys independentes (bot via Docker, site via Vercel).
- Negativas: mais cerimônia inicial (ports/adapters) e duas stacks de deploy para manter.
- O código Deno/Fresh anterior fica no histórico git como referência.
