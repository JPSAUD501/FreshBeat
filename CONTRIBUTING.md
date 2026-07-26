# Contribuindo com o FreshBeat

Obrigado por querer contribuir! 💜 Este guia cobre o essencial.

## Setup

```bash
git clone https://github.com/JPSAUD501/FreshBeat.git
cd FreshBeat
npm install
cp .env.example .env   # preencha as chaves
docker compose up -d postgres redis
npm run db:migrate
npm run dev
```

## Fluxo de trabalho

1. Crie uma branch a partir de `main`: `git checkout -b feat/minha-feature`
2. Faça commits seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`) — o commitlint valida automaticamente.
3. Antes de abrir PR, rode `npm run verify` e garanta que está tudo verde.
4. Abra o PR preenchendo o template. O CI precisa passar.

## Regras da casa

- **Arquitetura:** siga as camadas descritas em [ARCHITECTURE.md](ARCHITECTURE.md). Composer não chama API externa; use case não conhece grammY; `new` de adapter só no composition root.
- **Testes:** toda feature nova vem com testes unitários mockados. Testes de integração (APIs reais) são `*.integration.test.ts` e devem pular sem as env vars.
- **i18n:** toda mensagem nova usa `msg({ key, value })` e precisa das 4 traduções no catálogo (`packages/i18n/src/locales/`). O type-check e os testes de paridade cobram isso. Nomes de comandos ficam em inglês.
- **Segredos:** nunca commite `.env`. O CI roda gitleaks.
- **Decisões grandes:** registre um ADR em `docs/adr/` (copie o formato dos existentes).

## Reportando bugs e pedindo features

Use as [issues](https://github.com/JPSAUD501/FreshBeat/issues) com os templates disponíveis. Se o bot te deu um código `/support_error_{id}`, inclua-o no report.
