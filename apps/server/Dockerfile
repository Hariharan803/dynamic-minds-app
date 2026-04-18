FROM oven/bun:1.2.15-alpine

WORKDIR /app

# Install workspace dependencies from lockfile for reproducible builds.
COPY package.json bun.lock ./
COPY apps apps
COPY packages packages

RUN bun install --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["bun", "run", "--filter", "@student-platform/server", "start"]
