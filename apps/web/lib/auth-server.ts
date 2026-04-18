import type { Auth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

let authInstance: Auth | null = null;

/**
 * Lazy-loads auth so `next build` does not execute DB init from the route module graph.
 * `nextCookies()` applies Set-Cookie via Next's `cookies()` API (required for App Router sessions).
 */
export async function getAuth(): Promise<Auth> {
  if (!authInstance) {
    const { createStudentAuth } = await import("@student-platform/auth");
    authInstance = createStudentAuth([nextCookies()]);
  }
  return authInstance;
}
