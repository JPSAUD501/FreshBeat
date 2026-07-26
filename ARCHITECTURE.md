# Arquitetura do FreshBeat

Este documento descreve as decisões arquiteturais do FreshBeat. Decisões pontuais e seus contextos estão em [docs/adr](docs/adr).

## Visão geral

Monorepo (npm workspaces) com dois apps e packages compartilhados:

- **`apps/bot`** — bot de Telegram em Node.js + grammY, rodando em **modo polling** dentro do Docker Compose.
- **`apps/web`** — site em Next.js, deploy na **Vercel** (fora do compose principal).
- **`packages/*`** — config, database, cache, logging e i18n compartilhados.

## Camadas do bot (ports & adapters)

```
apps/bot/src/
├── domain/          # entidades, erros de domínio, PORTS (interfaces)
├── application/     # use cases — regras de negócio puras, sem I/O de framework
├── infrastructure/  # adapters: Drizzle, Redis, Last.fm, Spotify, provedores de letra, IA…
├── presentation/    # composers grammY FINOS, keyboards, formatters de mensagem
└── composition/     # composition root: único lugar onde adapters são instanciados
```

### Regras de ouro

1. **Dependências apontam para dentro**: presentation → application → domain. Infrastructure implementa ports do domain.
2. **Composers nunca chamam APIs externas** — só traduzem `ctx` ↔ use case e formatam a resposta.
3. **Injeção de dependência via construtor**, sempre contra interfaces. `new` de adapters só no composition root.
4. **Erros de negócio** estendem `AppError` e carregam uma `i18nKey` — o handler único (`bot.catch`) traduz e responde. Erros inesperados viram `/support_error_{id}` persistido no banco.
5. **Uma instância de tudo**: bot, pool de banco e Redis são criados uma vez no composition root.
6. **Estado temporário no Redis** com TTL e consumo de uso único (`TempStateStore`) — nunca em memória nem com `setTimeout`/sleeps.
7. **Cache de APIs externas no Redis** com TTL curto, via `getOrSet`.

## Camadas do site (Next.js)

```
apps/web/
├── app/
│   ├── [locale]/        # páginas localizadas (landing, privacy, terms, dashboard)
│   └── (oauth)/         # route group fora do prefixo: fluxos /auth/* e /api/auth/*
├── components/          # componentes compartilhados (client e server)
├── lib/                 # i18n do site, sessão (HMAC), auth Telegram/Last.fm, singletons server
└── middleware.ts        # negociação de locale via Accept-Language
```

- **Sem camada de domínio própria**: o site é fino por natureza — as regras (vínculo, sessão) vivem em `lib/` com funções puras testadas, e o acesso a dados usa os **mesmos packages do bot** (`@freshbeat/database` para o repositório de usuários, `@freshbeat/cache` para o estado de OAuth, `@freshbeat/config` para env).
- **Rotas de fluxo fora do prefixo de locale** (`(oauth)`): redirects do bot e do Last.fm não podem depender de idioma; as páginas de resultado negociam o idioma pelo `Accept-Language`.
- **Segredos só no server**: validação do Telegram Login Widget e assinatura md5 do Last.fm acontecem em route handlers; o client recebe, no máximo, o username público do bot.

## Fluxos externos importantes

- **Letras**: `lrcmux` e `LRCLIB` consultados **em paralelo**, escolhendo o melhor resultado (letra sincronizada vale mais); `lyrics.ovh` só é chamado se ambos falharem. Cache Redis por (artista, faixa).
- **IA**: textos (tradução, explicação, prompt de imagem, alt-text) via **OpenRouter + Vercel AI SDK**; imagens via **Replicate** com upload para **S3**; resultados cacheados por 30 dias. Cada capacidade de IA é um port separado (`AiTextGenerator` por modelo, `ImageGenerator`, `ImageStorage`) — trocar de provedor é trocar um adapter.
- **Callback data do Telegram (limite de 64 bytes)**: botões carregam um token curto (`lyr:get:`, `lyr:ex:`…) que aponta para o contexto completo no Redis — nunca dados truncados.

## Configuração

`@freshbeat/config` valida todas as variáveis com zod na inicialização e **falha rápido** com mensagem clara se algo estiver errado. Integrações opcionais (Spotify, IA, Replicate, S3) são grupos "tudo ou nada": ou o grupo está completo, ou a feature fica desabilitada explicitamente.

## Internacionalização

- Idiomas: **pt-BR** (base/fallback), **en-US**, **ja-JP**, **es-ES**.
- O texto pt-BR vive inline no código (`msg({ key, value })`) e serve de fallback final; os catálogos tipados garantem em **tempo de compilação** que nenhum idioma fica sem chave, e testes garantem paridade de placeholders.
- **Nomes de comandos são sempre em inglês**; apenas descrições e respostas são traduzidas (`setMyCommands` por `language_code`).

## Testes

- **Unitários** (Vitest): 100% mockados, sem rede nem banco, colocalizados (`*.test.ts`). Coverage com thresholds no CI (alvo ≥80% em `domain/` e `application/`).
- **Integração** (`*.integration.test.ts`): batem em APIs reais, **opt-in** (pulam sem as env vars), rodam agendados no CI com segredos.

## Infraestrutura local

- `docker-compose.yml` — Postgres + Redis + bot (+ serviço `migrate` one-shot).
- `docker-compose.all.yml` — inclui o site Next.js para desenvolvimento completo.
