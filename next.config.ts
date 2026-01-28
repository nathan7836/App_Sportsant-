import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
