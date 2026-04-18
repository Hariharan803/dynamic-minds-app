import "./env";

import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import {
  appRouter,
  createInnerContext,
  type AppSession,
} from "@student-platform/api";
import { auth } from "@student-platform/auth";

const port = Number(process.env.PORT ?? 3001);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const trpcHandler = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/trpc",
    router: appRouter,
    req: request,
    createContext: async () => {
      const session = await auth.api.getSession({ headers: request.headers });
      return createInnerContext({
        session: session as AppSession | null,
      });
    },
  });

const app = new Elysia()
  .use(
    cors({
      origin: webOrigin,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    }),
  )
  .use(
    rateLimit({
      duration: 60_000,
      max: 120,
    }),
  )
  .get("/health", () => ({ ok: true }))
  .all("/api/auth/*", async ({ request }) => auth.handler(request))
  .all("/trpc/*", async ({ request }) => trpcHandler(request));

app.listen({ port, hostname: "0.0.0.0" });

console.log(`API listening on http://localhost:${port}`);
