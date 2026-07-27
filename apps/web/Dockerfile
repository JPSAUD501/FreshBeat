# Imagem do site FreshBeat (Next.js) — usada pelo docker-compose.all.yml
# (dev/hml no Coolify ou stack local completa). Produção é Vercel.
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

# NEXT_PUBLIC_* são embutidos no bundle no build — chegam como build args
ARG NEXT_PUBLIC_BOT_USERNAME=FreshBeatBot
ARG NEXT_PUBLIC_GITHUB_URL=https://github.com/JPSAUD501/FreshBeat
ENV NEXT_PUBLIC_BOT_USERNAME=$NEXT_PUBLIC_BOT_USERNAME \
    NEXT_PUBLIC_GITHUB_URL=$NEXT_PUBLIC_GITHUB_URL

RUN npm run build --workspace @freshbeat/web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@freshbeat/web"]
