import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
    // Uploads pass through the auth middleware; allow batches of large photos.
    proxyClientMaxBodySize: "500mb",
  },
};

export default nextConfig;
