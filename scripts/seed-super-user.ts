/**
 * Creates the initial admin-style user via Better Auth (hashed password, linked credential account).
 * Requires root `.env` with DATABASE_URL and BETTER_AUTH_SECRET.
 *
 * Run: bun run scripts/seed-super-user.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });

const SUPER_USER = {
  name: "Hariharan",
  email: "hari00@gmail.com",
  password: "S2201@s2selv",
} as const;

const { auth } = await import("@student-platform/auth");

try {
  const result = await auth.api.signUpEmail({
    body: {
      name: SUPER_USER.name,
      email: SUPER_USER.email,
      password: SUPER_USER.password,
    },
  });

  console.log("Super user ready:", SUPER_USER.email);
  console.log("User id:", (result as { user?: { id: string } }).user?.id);
} catch (err: unknown) {
  const msg =
    err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
      ? (err as { message: string }).message
      : String(err);
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "";
  if (
    /already|USER_ALREADY|another email/i.test(msg) ||
    /already|USER_ALREADY/i.test(code)
  ) {
    console.log("User already exists:", SUPER_USER.email, "(no changes made)");
    process.exit(0);
  }
  console.error("Seed failed:", msg);
  process.exit(1);
}
