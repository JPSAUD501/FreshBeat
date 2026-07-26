import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Packages internos do monorepo são TS puro — o Next transpila na hora
  transpilePackages: [
    '@freshbeat/config',
    '@freshbeat/database',
    '@freshbeat/i18n',
    '@freshbeat/cache',
  ],
  webpack: (config) => {
    // Packages usam imports relativos com extensão .js (NodeNext);
    // ensina o webpack a resolvê-los para os .ts correspondentes
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    }
    return config
  },
}

export default nextConfig
