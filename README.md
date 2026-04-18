Dynamic minds

A student productivity app for tasks, notes, study planning, internships, and study groups.

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

## Live app

- Frontend (Vercel): `https://dynamic-minds-app.vercel.app`
- Backend (Render): `https://dynamic-minds-app-1.onrender.com`

## Docker (local full stack)

1. Copy envs and fill secrets:

   ```bash
   cp .env.example .env
   ```

2. Start the full stack:

   ```bash
   docker compose up --build
   ```

3.

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
- Ensure Next.js rewrites forward both `/api/auth/*` and `/trpc/*` to `INTERNAL_API_URL`.
- Keep `WEB_ORIGIN` and `BETTER_AUTH_URL` on Render aligned to the same Vercel URL.

### 3) Database on Neon

- Use the pooled Postgres connection string for `DATABASE_URL`.
- Run schema changes before/after deployment as needed:

  ```bash
  bun run db:generate
  bun run db:migrate
  ```
