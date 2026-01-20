import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '35mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark @neondatabase/serverless as external for server-side bundling
      config.externals = config.externals || [];
      config.externals.push({
        '@neondatabase/serverless': '@neondatabase/serverless',
      });
    }
    return config;
  },
};

export default nextConfig;
