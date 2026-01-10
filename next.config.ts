import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },

  // Exclude server folder from build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Handle optional wagmi connector dependencies
  webpack: (config, { isServer }) => {
    // Fix for optional peer dependencies in wagmi connectors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Externalize problematic optional dependencies
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@safe-global/safe-apps-sdk': false,
        '@safe-global/safe-apps-provider': false,
        '@react-native-async-storage/async-storage': false,
        '@gemini-wallet/core': false,
        '@base-org/account': false,
        'porto': false,
        'porto/internal': false,
      };
    }

    return config;
  },
};

export default nextConfig;
