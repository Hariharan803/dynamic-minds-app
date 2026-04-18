import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@student-platform/api";

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
