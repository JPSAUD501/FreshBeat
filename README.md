# 🎧 FreshBeat

Seu companheiro de música no Telegram: stats do seu Last.fm, letras de músicas e explicações com IA — em português, inglês, japonês e espanhol.

[![CI](https://github.com/JPSAUD501/FreshBeat/actions/workflows/ci.yml/badge.svg)](https://github.com/JPSAUD501/FreshBeat/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚧 **Em reconstrução:** o FreshBeat está sendo reescrito do zero com clean architecture. Acompanhe o progresso na branch [`feat/monorepo-rewrite`](https://github.com/JPSAUD501/FreshBeat/tree/feat/monorepo-rewrite).

## O que ele faz

- **`/playingnow`** — o que você está ouvindo agora, enriquecido com dados do Spotify, Deezer e YouTube
- **`/lyrics`** — letra da música, com busca inteligente (lrcmux → LRCLIB → lyrics.ovh) e tradução sob demanda
- **Explicação com IA** — o significado da letra, com imagem gerada por IA
- **`/history`** e **`/brief`** — seu histórico e um resumo do seu perfil musical
- **`/login`** — vinculação segura da conta Last.fm via site
- 🌐 **4 idiomas:** pt-BR, en-US, ja-JP, es-ES (nomes de comandos sempre em inglês)

## Estrutura do monorepo

```
apps/
  bot/        # Bot Telegram (Node.js + grammY, modo polling)
  web/        # Site (Next.js → Vercel)
packages/
  config/     # Variáveis de ambiente validadas com zod (fail-fast)
  database/   # Drizzle ORM + Postgres (schema e migrations)
  cache/      # Redis (cache, rate limit, estado temporário)
  logging/    # Logs estruturados com pino (sem segredos)
  i18n/       # Traduções tipadas nos 4 idiomas
```

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para as decisões de arquitetura.

## Desenvolvimento local

Pré-requisitos: **Node.js 22+** e **Docker** (para Postgres e Redis).

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env   # preencha as chaves (Telegram, Last.fm, …)

# 3. Suba Postgres + Redis
docker compose up -d postgres redis

# 4. Rode as migrations
npm run db:migrate

# 5. Suba o bot em modo dev (watch)
npm run dev
```

Ou suba **tudo** (bot + banco + redis + site) com Docker:

```bash
docker compose -f docker-compose.all.yml up --build
```

## Qualidade

```bash
npm run verify           # format + lint + typecheck + testes (o gate completo)
npm run test:coverage    # testes com coverage (thresholds enforced)
npm run test:integration # testes contra APIs reais (opt-in, requer chaves no .env)
```

O CI roda todos os gates em cada PR, mais build das imagens Docker e scan de segredos (gitleaks).

## Contribuindo

Contribuições são muito bem-vindas! Leia o [CONTRIBUTING.md](CONTRIBUTING.md) e o [Código de Conduta](CODE_OF_CONDUCT.md).

## Licença

[MIT](LICENSE) © João Pedro
