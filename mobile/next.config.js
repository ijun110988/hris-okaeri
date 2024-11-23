/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Allow connections from any host
  experimental: {
    serverActions: true,
  },
  // Configure hostname and port
  server: {
    hostname: '0.0.0.0',
    port: 3002,
  },
}

module.exports = nextConfig
