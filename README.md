# Deepo

Bun workspaces monorepo for the Mini Tools Suite.

## Workspace layout

- `apps/web`: Next.js 16 App Router application
- `packages/ui`: Shared UI exports
- `packages/lib`: Shared utility exports
- `packages/tools-core`: Pure tool logic and tests

## Commands

- `bun install`
- `bun dev`
- `bun run lint`
- `bun run typecheck`
- `bun test`
- `bun run build`

## Analytics (optional):

### GoatCounter

- Disabled by default. If `NEXT_PUBLIC_GOATCOUNTER_URL` is unset, empty, or invalid, no GoatCounter script is injected.
- To enable, set `NEXT_PUBLIC_GOATCOUNTER_URL` to your endpoint, for example: `https://stats.example.com/count`
- Self-hosters can point this to their own GoatCounter instance URL.
