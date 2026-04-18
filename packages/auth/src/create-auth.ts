import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@student-platform/db";
import {
  account,
  session,
  user,
  verification,
} from "@student-platform/db/schema";

const baseURL =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const shared = {
  baseURL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    baseURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
  ],
  advanced: {
    cookiePrefix: "student-platform",
  },
};

/**
 * Same Better Auth instance shape as `betterAuth()`; pass plugins for framework-specific behavior
 * (e.g. `nextCookies()` on Next.js App Router).
 */
export function createStudentAuth(plugins: BetterAuthPlugin[] = []) {
  return betterAuth({
    ...shared,
    ...(plugins.length ? { plugins } : {}),
  });
}

/** Default instance (Elysia API server, scripts). */
export const auth = createStudentAuth();

export type Session = typeof auth.$Infer.Session;
