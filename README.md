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

## Docker (local full stack)

1. Copy envs and fill secrets:

   ```bash
   cp .env.example .env
   ```

2. Start the full stack:

   ```bash
   docker compose up --build
   ```

3. Open [http://localhost:3000](http://localhost:3000).  
   The web container reaches the API through `http://server:3001` internally, while you can still access API health at [http://localhost:3001/health](http://localhost:3001/health).

## Deployment (Vercel + Render)

### 1) Backend on Render (Docker)

- Create a **Web Service** connected to this repository.
- Choose **Docker** deployment and set Dockerfile path to `apps/server/Dockerfile`.
- Set environment variables:
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET`
  - `WEB_ORIGIN=https://<your-vercel-domain>`
  - `BETTER_AUTH_URL=https://<your-vercel-domain>`
- `PORT` is provided by Render automatically.
- After deploy, note your public API URL, e.g. `https://<your-api>.onrender.com`.

### 2) Frontend on Vercel (Next.js)

- Use repository root with `vercel.json` as the source of truth.
- Required environment variables:
  - `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>`
  - `INTERNAL_API_URL=https://<your-api>.onrender.com`
- Keep `WEB_ORIGIN` and `BETTER_AUTH_URL` on Render aligned to the same Vercel URL.

### 3) Database on Neon

- Use the pooled Postgres connection string for `DATABASE_URL`.
- Run schema changes before/after deployment as needed:

  ```bash
  bun run db:generate
  bun run db:migrate
  ```

## Phase 2 (ideas)

AI study planner, WebSockets for live groups, reminders, file uploads (S3/Cloudinary) — not implemented in this scaffold.
