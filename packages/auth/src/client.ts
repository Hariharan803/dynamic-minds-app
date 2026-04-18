import { createAuthClient } from "better-auth/react";

/**
 * Omit `baseURL` so the client uses `window.location.origin` in the browser (see better-auth `getBaseURL`).
 * That keeps sign-in/up working whether you open the app via `localhost` or `127.0.0.1`.
 * For SSR, set `NEXT_PUBLIC_BETTER_AUTH_URL` / `BETTER_AUTH_URL` if you need a fixed origin.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});
