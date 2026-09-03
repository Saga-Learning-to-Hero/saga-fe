import type { NextConfig } from "next";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${apiBaseUrl}/oauth2/:path*`,
      }
    ];
  },
};

export default nextConfig;
