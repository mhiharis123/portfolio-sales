import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Dokploy (Docker) deployment
  // Remove this when deploying to Netlify
  output: process.env.DEPLOY_TARGET === "netlify" ? undefined : "standalone",

  // Rewrite API requests to Dokploy backend when on Netlify
  async rewrites() {
    // Only apply rewrites for Netlify builds
    if (process.env.DEPLOY_TARGET === "netlify" && process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.ALLOWED_ORIGIN || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
