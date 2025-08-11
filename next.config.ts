/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Skip TypeScript type checking
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Skip ESLint checks
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

