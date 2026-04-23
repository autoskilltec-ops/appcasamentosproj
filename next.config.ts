import type { NextConfig } from "next";
import path from "path";

// Supabase uses a self-signed cert in its chain; disable verification for the pg driver
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.5"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
