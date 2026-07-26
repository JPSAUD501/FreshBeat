# Imagem do bot FreshBeat (monorepo — roda o workspace @freshbeat/bot com tsx).
# Fase 7 endurece isso com multi-stage/prod-only; hoje priorizamos simplicidade.
FROM node:22-alpine

WORKDIR /app

# Manifests primeiro para cache de dependências
COPY package.json package-lock.json ./
COPY apps/bot/package.json apps/bot/
COPY apps/web/package.json apps/web/
COPY packages/cache/package.json packages/cache/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY packages/i18n/package.json packages/i18n/
COPY packages/logging/package.json packages/logging/

RUN npm ci

COPY . .

# Migrar o banco:  docker compose run --rm bot npm run db:migrate --workspace @freshbeat/database
# Subir o bot:     comando padrão abaixo
CMD ["npm", "run", "start", "--workspace", "@freshbeat/bot"]
