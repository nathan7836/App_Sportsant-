import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs', 'firebase-admin'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
