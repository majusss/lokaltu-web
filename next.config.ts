import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV !== "production"
          ? [
              "https://rkgrj15m-3000.euw.devtunnels.ms",
              "http://localhost:3000",
              "https://localhost:3000",
              "localhost:3000",
            ]
          : [],
    },
  },
};

export default nextConfig;
