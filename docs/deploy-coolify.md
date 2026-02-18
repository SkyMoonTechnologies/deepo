# Deploy to Coolify (GHCR Image)

This setup deploys `apps/web` as a container running `next start` on port `3000`.

## 1. Prerequisites

- A GitHub repository with Actions enabled.
- A Coolify instance with access to pull from GHCR.
- GitHub package permissions for the repository.

## 2. Required repository secrets (GitHub)

For this workflow, no extra secret is required beyond `GITHUB_TOKEN` because `release-ghcr.yml` uses it to push to GHCR.

## 3. Build and publish image

The workflow at `.github/workflows/release-ghcr.yml` publishes:

- `ghcr.io/<owner>/<repo>:main`
- `ghcr.io/<owner>/<repo>:sha-<full-commit-sha>`

Push to `main` (or run workflow manually) to publish both tags.

## 4. Coolify service setup

1. In Coolify, create a new **Docker Compose** service.
2. Set the compose file to the contents of `deploy/docker-compose.yml`.
3. Replace `ghcr.io/OWNER/REPO` with your real image path (`ghcr.io/<owner>/<repo>`).
4. Set `IMAGE_TAG`:
   - `main` for the rolling stable image.
   - `sha-<commit-sha>` for a pinned immutable release.
5. Expose port `3000`.

## 5. Environment variables (exact list)

Set these in Coolify:

- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_APP_NAME=Deepo`
- `IMAGE_TAG=main` (or `sha-<commit-sha>`)

Optional Clerk variables for v1 (can be empty):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`
- `CLERK_SECRET_KEY=`
- `CLERK_WEBHOOK_SECRET=`

Optional analytics variable:

- `GOATCOUNTER_URL=` (default empty/disabled)
- Example enable value: `GOATCOUNTER_URL=https://stats.example.com/count`

## 6. Health check

The app exposes:

- `GET /api/health`
- Response: `{ "ok": true }`

Use `http://<your-domain>/api/health` to verify deployment health.

## 7. Runtime behavior

- Container command runs `next start` bound to `0.0.0.0` on port `3000`.
- Compose includes a container healthcheck that calls `/api/health`.
