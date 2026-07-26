import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Packages internos do monorepo são TS puro — o Next transpila na hora
  transpilePackages: ['@freshbeat/config', '@freshbeat/database', '@freshbeat/i18n'],
}

export default nextConfig
