import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native-binary packages: keep as a true runtime require (full node_modules
  // tree, .so/.node files included) instead of letting webpack/turbopack
  // bundle+trace them, which can't see a dlopen'd binary and drops it.
  serverExternalPackages: ["@electric-sql/pglite", "sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
    // Uploads pass through the auth middleware; allow batches of large photos.
    proxyClientMaxBodySize: "500mb",
  },
};

export default nextConfig;
