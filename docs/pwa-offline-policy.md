# Offline Caching Policy (Minimal PWA)

## Scope

Deepo uses a minimal custom service worker in `/apps/web/public/sw.js` to provide conservative offline support for shell and static assets.

## What Is Cached

- App shell routes: `/` and `/offline`
- Static framework assets under `/_next/static/*`
- Public static assets:
  - `/manifest.webmanifest`
  - `/favicon.ico`
  - `/icons/*`

Caching strategy:
- Precache shell URLs on service worker install.
- Runtime cache static asset requests on first successful fetch.
- Navigation requests use network-first with offline fallback to `/offline`.

## What Is Not Cached

- API responses
- Tool input/output payloads
- Any request that is not `GET`
- Any cross-origin request
- Dynamic/sensitive tool data and secrets

This is intentional to reduce data retention risk and avoid storing sensitive user content in Cache Storage.

## Operational Notes

- Service worker files are served with `Cache-Control: no-cache, no-store, must-revalidate` via Next config to reduce stale worker risk.
- To force clients onto a new cache generation, bump `CACHE_VERSION` in `/apps/web/public/sw.js`.
