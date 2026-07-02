import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Transpile shared package dari monorepo
  transpilePackages: ["@harmoni/ui"],
};

export default nextConfig;
