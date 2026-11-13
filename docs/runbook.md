# Production Runbook — Accessibility Playground

## 1. System Overview

Accessibility Playground is a client-centric web application built with Next.js 16 (Turbopack) and React 19. The application performs client-side accessibility audits using `axe-core`, renders user code inside an isolated opaque-origin iframe sandbox (`sandbox="allow-scripts"`), and manages state in local storage.

## 2. Environment & Prerequisites

- **Node.js**: `22.x` (enforced via `.nvmrc`)
- **Package Manager**: `npm` only (`package-lock.json`)
- **Required Environment Variables**:
  - `NEXT_PUBLIC_SITE_URL`: Canonical base URL (e.g. `https://accessibility-playground.dev` or `http://localhost:3000`). Used for metadata generation, OpenGraph tags, canonical links, robots.txt, and sitemap.xml.

## 3. Build & Deployment Procedure

### Vercel / Cloudflare / Static Hosting

1. Set Root Directory to repository root.
2. Ensure Install Command is `npm ci`.
3. Set Build Command to `npm run build`.
4. Configure Environment Variable `NEXT_PUBLIC_SITE_URL`.
5. Deploy.

### Self-Hosted / Node.js

```bash
git checkout <release-tag-or-sha>
npm ci
npm run check
npm test
npm run build
NODE_ENV=production npm run start -p 3000
```

## 4. Health & Monitoring

### Health Endpoint

- **URL**: `/api/health`
- **Method**: `GET`
- **Expected Response**: `200 OK`
- **Body**:
  ```json
  {
    "ok": true,
    "version": "0.1.0",
    "timestamp": "2026-11-13T..."
  }
  ```
- **Cache-Control**: `no-store, no-cache, must-revalidate`

Configure uptime checkers (Datadog, Pingdom, BetterStack, Cloudwatch Synthetics) to hit `/api/health` every 60 seconds with a 5-second timeout.

### Error Logs

- Client errors captured by React Error Boundaries (`app/error.tsx`, `app/(workbench)/error.tsx`, `app/global-error.tsx`) or uncaught exceptions are sanitized and transmitted via `POST /api/report`.
- Server logs will emit:
  ```text
  [ClientErrorReport] {"level":"error","route":"/playground","error":{"name":"...","message":"..."},"context":{...}}
  ```
- All client HTML/CSS, user-pasted code, snippets, query parameters (`?s=`), and sensitive tokens are strictly scrubbed prior to dispatch.
- To search logs: filter for `[ClientErrorReport]`.

## 5. Rollback Procedure

If a production issue occurs:

1. **Managed Platforms (Vercel)**:
   - Navigate to Deployments.
   - Select the previous stable deployment.
   - Click "Instant Rollback".
2. **Containerized / VM Deployment**:
   - Redeploy the previous Git commit hash or container image tag:
     ```bash
     git checkout <previous-stable-sha>
     npm ci
     npm run build
     pm2 restart accessibility-playground || systemctl restart accessibility-playground
     ```
3. Since Accessibility Playground has no database migrations or backend data stores, rollbacks are zero-data-loss operations.

## 6. Secrets & Rotation

- **Secret Inventory**: None.
- The playground has zero backend credentials, zero database connections, and zero third-party private API keys.
- No periodic secret rotation is required.

## 7. Preview & Staging Deployments

- Preview deployments on non-production hostnames must have `X-Robots-Tag: noindex, nofollow` set at the edge or platform level to prevent search engine indexing of draft branches.
- The root `src/app/robots.ts` disallows indexing of share query URLs (`/*?s=*`).
