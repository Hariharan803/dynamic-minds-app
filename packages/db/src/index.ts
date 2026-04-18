import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env before starting the app.",
    );
  }

  const isExampleConnectionString =
    databaseUrl.includes("://user:password@") ||
    databaseUrl.includes("ep-xxx.us-east-2.aws.neon.tech");

  if (isExampleConnectionString) {
    throw new Error(
      "DATABASE_URL is still using the example value from .env.example. Replace it with your real Neon Postgres connection string, then run `bun run db:push`.",
    );
  }

  return databaseUrl;
}

const databaseUrl = getDatabaseUrl();
const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
export type Database = typeof db;
export { schema };
export * from "./schema";
