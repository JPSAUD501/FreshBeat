# ADR 0003: vínculo Last.fm via site com estado Redis de uso único

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

O bot precisa vincular a conta Last.fm do usuário, mas o OAuth do Last.fm é um fluxo web (redirect). O MelodyScout resolvia com estado em memória + polling/`sleep` — frágil, não sobrevive a restart e não escala além de um processo. Bot e site são processos separados (polling no Docker, Vercel serverless), então o estado precisa viver fora dos dois.

## Decisão

1. `/login` no bot cria um token aleatório no **Redis** (`TempStateStore`, namespace `login`, TTL 10 min) apontando para o `telegramUserId`, e responde com o link `${WEB_BASE_URL}/auth/lastfm?state={token}`.
2. O site valida o estado com `peek` (sem consumir — o usuário pode abandonar e voltar pelo mesmo link dentro do TTL) e redireciona para a autorização do Last.fm.
3. O callback (`/api/auth/lastfm/callback`) **consome** o estado (uso único, anti-replay), troca o token via `auth.getSession` (assinatura md5) e grava o vínculo com o `DrizzleUserRepository` de `packages/database` — o mesmo repositório que o bot usa, então o vínculo vale imediatamente.
4. O dashboard usa o mesmo padrão de validação server-side: Telegram Login Widget (HMAC-SHA256 com chave `SHA256(bot_token)`, janela de 24h) + cookie de sessão stateless assinado com `WEB_SESSION_SECRET`.

## Consequências

- Positivas: sem sleeps nem polling; estado sobrevive a restarts e funciona entre processos/máquinas; token de uso único impede replay; nenhum segredo do Telegram ou Last.fm no client.
- Negativas: o vínculo depende do Redis e do site estarem no ar; o domínio do site precisa estar registrado no BotFather (`/setdomain`) para o widget de login funcionar.
