import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['motion'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
