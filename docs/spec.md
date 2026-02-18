# Mini Tools Suite Spec (Bun + Square UI Bookmarks UX)

## North Star

A single Next.js app hosting 25 mini tools with premium UX:

- No login required for core tools
- Offline-ready for all local artifacts
- Consistent two-panel tool pages (input left, output right)
- Favorites + Recents as first-class surfaces
- Shareable permalinks that encode state in the URL when safe

## Locked Constraints

- Monorepo with Bun workspaces
- Next.js 16 App Router, TypeScript
- shadcn/ui + shadcn blocks
- Clerk installed but optional (only for future sync)
- Minimal to zero useEffect (allowed only with explicit justification comment)
- Deploy to Coolify on Hetzner VPS via GHCR image + compose/stack

## UX Reference Target

Mirror the “Square UI Bookmarks” information architecture and layout patterns:

- Left sidebar with:
  - Global search hint
  - Collections section
  - Tags section
  - System sections (Favorites)
- Top bar in main panel:
  - Search
  - view toggle (grid/list) (v1 can ship grid only, but keep the toggle stub)
  - Sort (Date)
  - Filter
  - Primary action button
- Main area:
  - Stats cards row
  - Header for current collection
  - Grid of tiles with:
    - Icon/thumbnail area
    - Title + description
    - Tag pills
    - Quick actions (favorite heart, overflow menu)

In this project:

- "Bookmarks" -> "Tools"
- "Bookmark tiles" -> "Tool tiles"
- Collections are tool collections (Build, Ship, Design, Operate, Write) and saved surfaces.

## Routes

- / (default: All Tools)
- /c/[collectionId] (collection view)
- /favorites
- /recents
- /t/[toolId] (tool page)

## Data Model (Local-first)

IndexedDB via `idb` (no server in v1).

- ToolCard:
  - id, toolId, title
  - createdAt, updatedAt
  - payload (tool-specific, safe subset only)
- Favorite:
  - toolId, pinnedAt
- Recent:
  - toolId, lastUsedAt

Note: Favorites apply to tools and saved cards independently.
V1 can implement for tools first; cards follow same pattern.

## URL State (Permalinks)

- Each tool defines:
  - encodeState(state) -> query
  - decodeState(query) -> state
  - isShareSafe(state) -> boolean
- Never encode secrets:
  - JWT verify keys, HMAC secrets, uploaded files, invoice customer data

## Tech Decisions

- Tool engine logic in packages/tools-core (pure functions, unit-tested)
- UI in apps/web, with shared components in packages/ui
- Tool pages:
  - Server component shell
  - Client-only ToolClient loaded via next/dynamic({ ssr: false })
- Clipboard, download, save-card triggered only via event handlers (avoid effect-driven persistence)

## Deploy Decisions

- Build and push Docker image to GHCR
- Coolify pulls GHCR image and runs Next.js server
- No Redis in v1 (optional later for paid sync/queues)

## Build Order (first ship)

1. JSON formatter/validator/tree
2. JWT decode (verify optional in v1)
3. Base64/URL/HTML encode-decode
4. Text diff + JSON semantic diff
5. Regex tester
6. Timestamp + cron
7. Contrast + color converter
8. Image optimize
9. Template builders (PRD, ADR, status, meeting notes, release notes)
10. UTM, unit economics, invoice/quote PDF
