import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_CDN_URL as string).hostname,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
