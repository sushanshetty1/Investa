import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { dev, isServer }) => {
    // Fix for Supabase realtime-js critical dependency warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "net": false,
      "tls": false,
      "crypto": false,
    };

    // Ignore critical dependency warnings for @supabase/realtime-js
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
  
  // Experimental features to help with caching issues
  experimental: {
    // Disable webpack cache in development to prevent cache corruption
    ...(process.env.NODE_ENV === 'development' && {
      webpackBuildWorker: false,
    }),
  },
};

export default nextConfig;
