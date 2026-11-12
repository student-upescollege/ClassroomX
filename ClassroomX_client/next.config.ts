import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /@vladmandic\/face-api/ },
      /Critical dependency/,
    ];
    return config;
  },
};

export default nextConfig;
