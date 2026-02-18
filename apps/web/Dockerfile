FROM oven/bun:1.2.22 AS deps
WORKDIR /app

COPY bun.lock package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/lib/package.json packages/lib/package.json
COPY packages/tools-core/package.json packages/tools-core/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN bun run --filter @deepo/web build

FROM oven/bun:1.2.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages

EXPOSE 3000
WORKDIR /app/apps/web

CMD ["bun", "run", "start", "--", "--port", "3000", "--hostname", "0.0.0.0"]
