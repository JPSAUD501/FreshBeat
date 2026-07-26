# Imagem do site FreshBeat (Next.js) — usada apenas pelo docker-compose.all.yml
# para desenvolvimento local completo. Produção é Vercel.
FROM node:22-alpine

WORKDIR /app

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

RUN npm run build --workspace @freshbeat/web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@freshbeat/web"]
