# Privacy Statement

## Core Commitment

Accessibility Playground runs client-side analysis directly inside your browser. No accounts are required, and your code does not leave your machine during normal operation.

## What Never Leaves Your Browser

- **User Code and Documents**: Your HTML, CSS, custom snippets, and challenge solutions remain entirely within your browser session and local storage.
- **Share Links**: Encoded share URLs (`?s=...`) are decompressed and parsed client-side. The shared document is never stored on or transmitted to an external server.
- **Analytics & Tracking**: There are no tracking cookies, analytics SDKs, advertising beacons, or telemetry trackers installed on this site.

## What is Stored Locally

The application uses browser `localStorage` solely to preserve your work across visits:

- Active editor document and history
- Workbench settings (theme, wrap mode, tab size, layout orientation)
- Challenge completion markers and revealed hints count
- Contrast checker color pairs

You can clear this data at any time through your browser settings or via the "Start Fresh" action in the workbench.

## Error Monitoring and Telemetry

To maintain platform stability, fatal runtime crashes trigger a minimal, sanitized error report sent to `/api/report`. This report is strictly scrubbed before transmission:

- **Included**: Error name, sanitized message, sanitized stack trace, route pathname (without query parameters or hashes), application version, and timestamp.
- **Excluded**: HTML tags, CSS rules, document contents, share payloads, query parameters (`?s=`), URL hashes, IP addresses, and user identifiers are stripped or redacted.
- **Offline Resilience**: When your browser is offline, no report attempts are made and error dispatch fails silently without blocking the user interface.

## Sandboxing

User-rendered preview content executes inside an isolated iframe with `sandbox="allow-scripts"` (strictly excluding `allow-same-origin`). The preview iframe cannot access your cookies, localStorage, or parent application state.
