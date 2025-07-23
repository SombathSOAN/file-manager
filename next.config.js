/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL,
    UPLOAD_DIR: process.env.UPLOAD_DIR || "/app/uploads",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
