export function getAuthErrorMessage(error: unknown, action: "sign up" | "sign in") {
  if (error instanceof Error) {
    const message = error.message.trim();

    if (message && message !== "Failed to fetch") {
      return message;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return `Could not ${action}. Ensure DATABASE_URL in the repo-root .env is a real Postgres URL (not the .env.example placeholder) and run 'bun run db:push'. For dashboard data, start the API with 'bun run dev:server'.`;
  }

  return `Could not ${action}`;
}
