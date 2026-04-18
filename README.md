# Student Platform

Monorepo for a student productivity app: tasks, notes, study planner, exams, internships, and study groups.

## Stack

- **Runtime:** Bun  
- **Web:** Next.js (App Router)  
- **API:** Elysia + tRPC  
- **Auth:** Better Auth (email/password)  
- **Database:** PostgreSQL on Neon, Drizzle ORM  

## Repo layout

```
apps/web       → Next.js frontend
apps/server    → Elysia + tRPC + Better Auth HTTP handler
packages/db    → Drizzle schema & DB client
packages/api   → tRPC routers (Zod validation)
packages/auth  → Better Auth server + shared client
packages/ui    → Shared React layout/cards (uses Next.js `Link`)
```

## Prerequisites

- [Bun](https://bun.sh)  
- A [Neon](https://neon.tech) Postgres database  

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill `DATABASE_URL`, `BETTER_AUTH_SECRET`, and URLs if not using localhost defaults.

2. Install dependencies:

   ```bash
   bun install
   ```

3. Push the schema to Neon (development):

   ```bash
   bun run db:push
   ```

   For production, prefer `bun run db:generate` and `bun run db:migrate` after reviewing SQL.

4. Start the API and the web app (two processes):

   ```bash
   bun run dev
   ```

   Or separately: `bun run dev:server` (port **3001**) and `bun run dev:web` (port **3000**).

5. Open [http://localhost:3000](http://localhost:3000), sign up, then use the dashboard and modules.

Next.js rewrites proxy `/api/auth/*` and `/trpc/*` to the Elysia server so cookies stay on the same origin as the UI.

## Security notes

- Protected UI routes use middleware plus session cookies (heuristic cookie names).  
- tRPC procedures use Better Auth `getSession` on the server; mutations/queries use Zod.  
- Elysia uses `elysia-rate-limit` and CORS restricted to `WEB_ORIGIN`.  

## Deployment sketch

- **Frontend:** Vercel — set `NEXT_PUBLIC_APP_URL`, `INTERNAL_API_URL` (your public API URL), and ensure the API allows that origin in `WEB_ORIGIN` / Better Auth `trustedOrigins`.  
- **Backend:** Railway / Fly.io / Render — expose HTTPS, set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (public app URL), `WEB_ORIGIN`.  
- **Database:** Neon — use the pooled connection string for serverless runtimes.  

## Phase 2 (ideas)

AI study planner, WebSockets for live groups, reminders, file uploads (S3/Cloudinary) — not implemented in this scaffold.
