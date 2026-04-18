import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

/** Repo-root `.env` (Next’s default cwd is `apps/web`). */
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const serverUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: ["@student-platform/ui", "@student-platform/auth", "@student-platform/db"],
  async rewrites() {
    return [
      { source: "/trpc/:path*", destination: `${serverUrl}/trpc/:path*` },
    ];
  },
};

export default nextConfig;
