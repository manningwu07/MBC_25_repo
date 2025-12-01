import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        "~/*": ["./src/*"],
      },
    },
  },
};

export default nextConfig;