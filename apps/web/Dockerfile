FROM oven/bun:1.2.15-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps apps
COPY packages packages

RUN bun install --frozen-lockfile
RUN bun run --filter @student-platform/web build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "--filter", "@student-platform/web", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
