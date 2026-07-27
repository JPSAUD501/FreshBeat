# 🎧 FreshBeat

Seu companheiro de música no Telegram: stats do seu Last.fm, letras de músicas e explicações com IA — em português, inglês, japonês e espanhol.

[![CI](https://github.com/JPSAUD501/FreshBeat/actions/workflows/ci.yml/badge.svg)](https://github.com/JPSAUD501/FreshBeat/actions/workflows/ci.yml)
[![Integration](https://github.com/JPSAUD501/FreshBeat/actions/workflows/integration.yml/badge.svg)](https://github.com/JPSAUD501/FreshBeat/actions/workflows/integration.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## O que ele faz

- **`/playingnow`** (alias `/pn`, `/pntrack`) — o que você está ouvindo agora: scrobbles (faixa/álbum/artista), tempo de audição, badge de explícita, popularidade, botões de letra, explicação com IA e links Spotify/Deezer
- **`/pnalbum`** e **`/pnartist`** — o álbum e o artista da faixa atual, com seu ranking pessoal de faixas e tempo de audição
- **`/lyrics`** — letra da música, com busca inteligente: **lrcmux e LRCLIB em paralelo** (escolhe o melhor resultado, preferindo letra sincronizada) e **lyrics.ovh** só se ambos falharem. Tradução sob demanda para o seu idioma
- **Explicação com IA** — o significado da letra no seu idioma, com **imagem gerada por IA** inspirada na música (e alt-text para acessibilidade)
- **`/history`** — suas últimas faixas, com repetições consecutivas colapsadas (`x3`)
- **`/brief`** — resumo do seu perfil: métricas, top faixas/álbuns/artistas e tempo total de audição
- **`/login`** — vinculação segura da conta Last.fm via site (OAuth), **`/forgetme`** para apagar tudo
- 🌐 **4 idiomas:** pt-BR, en-US, ja-JP, es-ES (nomes de comandos sempre em inglês)

## O site

Em Next.js (deploy na Vercel): landing page nos 4 idiomas, páginas de privacidade/termos, fluxo de **OAuth do Last.fm** e **dashboard** com login via Telegram — onde dá para ver a conta vinculada, seus números no Last.fm e desvincular.

## Estrutura do monorepo

```
apps/
  bot/        # Bot Telegram (Node.js + grammY, modo polling)
  web/        # Site (Next.js → Vercel)
packages/
  config/     # Variáveis de ambiente validadas com zod (fail-fast)
  database/   # Drizzle ORM + Postgres (schema, migrations, repositório compartilhado)
  cache/      # Redis (cache, rate limit, estado temporário de uso único)
  logging/    # Logs estruturados com pino (sem segredos)
  i18n/       # Traduções tipadas do bot nos 4 idiomas
```

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para as decisões de arquitetura e [docs/adr](docs/adr) para o histórico de decisões.

## Desenvolvimento local

Pré-requisitos: **Node.js 22+** e **Docker** (para Postgres e Redis).

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env   # preencha as chaves (Telegram, Last.fm, …)

# 3. Suba Postgres + Redis + MinIO
docker compose up -d postgres redis minio

# 4. Rode as migrations
npm run db:migrate

# 5. Suba o bot em modo dev (watch)
npm run dev
```

O site sobe separado (em produção vai para a Vercel):

```bash
npm run dev --workspace @freshbeat/web   # http://localhost:3000
```

Ou suba a stack completa com Docker. São dois arquivos, pensados para o fluxo **Coolify + Vercel**:

| Arquivo                  | Serviços                       | Uso                                            |
| ------------------------ | ------------------------------ | ---------------------------------------------- |
| `docker-compose.yml`     | Postgres + Redis + MinIO + bot | **Produção** (Coolify) — o site fica na Vercel |
| `docker-compose.all.yml` | tudo acima **+ site**          | **Dev/HML** (Coolify) ou tudo local            |

```bash
docker compose up --build                            # sem o site
docker compose -f docker-compose.all.yml up --build  # com o site
```

O MinIO (storage S3 das imagens geradas por IA) sobe junto, com o bucket criado automaticamente. O console web fica em `http://localhost:9001` (troque `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` no `.env` em produção).

> **Login do dashboard em dev:** o Telegram Login Widget exige o domínio registrado no BotFather (`/setdomain`). Em `localhost` funciona sem configurar; em produção, registre o domínio do site.

## Qualidade

```bash
npm run verify           # format + lint + typecheck + testes (o gate completo)
npm run test:coverage    # testes com coverage (thresholds enforced: ≥80%)
npm run test:integration # testes contra APIs reais (opt-in, requer chaves no .env)
```

O CI roda todos os gates em cada PR, mais build das imagens Docker e scan de segredos (gitleaks). Testes de integração rodam agendados (nightly) com os segredos do repositório.

## Contribuindo

Contribuições são muito bem-vindas! Leia o [CONTRIBUTING.md](CONTRIBUTING.md), o [Código de Conduta](CODE_OF_CONDUCT.md) e, se for mexer com textos, o [guia de i18n](docs/i18n.md).

## Licença

[MIT](LICENSE) © João Pedro
