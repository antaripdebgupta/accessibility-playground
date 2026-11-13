# Security & Content Security Policy (Part 2)

## Architectural Design: Option A (Dedicated Preview Shell)

The Accessibility Playground runs untrusted, user-authored HTML and CSS in a live preview sandbox while performing client-side axe-core audits and tab sequence tracing.

Because an iframe loaded via `srcdoc` inherits its parent browsing context's Content Security Policy, enforcing a strict CSP on the parent application would either break the preview (blocking inline scripts, user event handlers, and Tailwind CDN) or require degrading site-wide CSP protections to the lowest common denominator.

Under Option A, the application isolates the preview environment:

1. **Dedicated Route Shell (`/preview-frame`)**:
   - Served with `sandbox="allow-scripts"` (without `allow-same-origin`), guaranteeing an opaque origin (`null`).
   - Governed by its own isolated, scoped CSP allowing execution of axe-core, the postMessage bridge, and inline user scripts, while strictly disabling outbound network connections (`connect-src 'none'`) and form submissions (`form-action 'none'`).
   - Framable only by the playground itself via `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN`.
2. **Strict Site-Wide CSP**:
   - Site routes enforce `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `upgrade-insecure-requests`.
   - Framing of any top-level application page is completely blocked (`X-Frame-Options: DENY`).
3. **Cross-Origin PostMessage Communication**:
   - The parent host and sandboxed frame communicate exclusively via typed schemas validated with Zod.
   - Message origin verification verifies that `event.source` matches `iframeRef.current.contentWindow`.

---

## Content Security Policy Directives

### Site Routes (`/((?!preview-frame).*)`)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;
```

### Preview Route (`/preview-frame`)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'none'; form-action 'none'; frame-ancestors 'self';
```

---

## Security Headers Inventory

| Header                          | Value                                                                              | Purpose                                                            |
| :------------------------------ | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `Strict-Transport-Security`     | `max-age=63072000; includeSubDomains`                                              | Enforces HTTPS across domain and subdomains                        |
| `X-Content-Type-Options`        | `nosniff`                                                                          | Prevents MIME-sniffing attacks                                     |
| `X-Frame-Options`               | `DENY` (Site) / `SAMEORIGIN` (`/preview-frame`)                                    | Prevents clickjacking                                              |
| `Referrer-Policy`               | `strict-origin-when-cross-origin`                                                  | Protects sensitive paths in referrers                              |
| `Permissions-Policy`            | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` | Restricts privileged browser APIs while allowing `clipboard-write` |
| `Cross-Origin-Opener-Policy`    | `same-origin`                                                                      | Isolates top-level browsing context                                |
| `Cross-Origin-Resource-Policy`  | `same-origin`                                                                      | Prevents unauthorized cross-origin asset reads                     |
| `Cache-Control` (`/axe.min.js`) | `public, max-age=31536000, immutable`                                              | Caches static audit engine immutably                               |

---

## Verification & Automated Test Results

Local validation executed via `node scripts/check-security-headers.mjs` against `next start`:

- **Route `/`**: Grade A+ (All security headers verified)
- **Route `/playground`**: Grade A+ (All security headers verified)
- **Route `/preview-frame`**: Grade A+ (Isolated CSP, sameorigin framing verified)
- **Route `/axe.min.js`**: Grade A+ (Immutable 1-year cache and CORP verified)

Playwright end-to-end verification (`e2e/security.spec.ts`):

- 10/10 automated tests passed across desktop and mobile browsers.
- Zero CSP violations recorded during full editor, audit, analysis tab, snippet, and export workflows.
- Malicious share payload (`?s=...` containing XSS script and `onerror` handlers) confirmed blocked from accessing parent origin `localStorage`, `document`, and state variables.
