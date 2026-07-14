import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  // db/client.ts reads *.sql migration files from the filesystem at runtime
  // (drizzle's migrator, not an import), so Vercel's automatic serverless
  // bundling would otherwise prune them as unreferenced.
  outputFileTracingIncludes: {
    "/api/**": ["../../packages/database/migrations/**"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
    // Uploads pass through the auth middleware; allow batches of large photos.
    proxyClientMaxBodySize: "500mb",
  },
};

export default nextConfig;
