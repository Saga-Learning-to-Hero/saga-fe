import type { NextConfig } from "next";

const targetApiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://api.saga.autos").trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${targetApiUrl}/api/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${targetApiUrl}/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
