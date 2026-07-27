#!/usr/bin/env bash
# Sobe o site localmente para QA apontando para o docker do WSL.
set -euo pipefail
cd "$(dirname "$0")/../apps/web"

set -a
# shellcheck disable=SC1091
source ../../.env
set +a

export DATABASE_URL="postgres://freshbeat:freshbeat@172.29.31.234:5432/freshbeat"
export REDIS_URL="redis://172.29.31.234:6379"

exec npx next start -p 3100
