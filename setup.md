# Setup & Commands

## Prerequisites

- Node.js (see `.nvmrc` for the pinned version)
- npm

---

## Setup

```bash
git clone https://github.com/antaripdebgupta/accessibility-playground.git
cd accessibility-playground
npm install
```

---

## Running the App

| Goal                   | Command         |
| ---------------------- | --------------- |
| Development server     | `npm run dev`   |
| Production build       | `npm run build` |
| Serve production build | `npm run start` |

Open [http://localhost:3000](http://localhost:3000).

---

## Code Quality Commands

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run lint`         | ESLint 9 checks (includes `jsx-a11y`)         |
| `npm run lint:fix`     | Auto-fix ESLint issues                        |
| `npm run typecheck`    | TypeScript strict-mode check (`tsc --noEmit`) |
| `npm run format:check` | Verify Prettier formatting                    |
| `npm run format`       | Format all files and sort Tailwind classes    |
| `npm run check`        | Lint + typecheck + format check (CI gate)     |

---

## Testing

### Unit tests (Vitest)

```bash
npm test                  # run all unit tests
npm test -- --watch       # watch mode
npm test -- path/to/file  # single file
```

Configuration: [`vitest.config.mjs`](./vitest.config.mjs)

- Environment: `jsdom`
- Globals enabled
- `@accessly-ui/*` packages inlined by the dev server
- `e2e/` excluded

### E2E tests (Playwright)

```bash
npm run build && npm run start   # Playwright requires a running server
npm run test:e2e                 # run all e2e specs
```

Configuration: [`playwright.config.ts`](./playwright.config.ts)

- Base URL: `http://localhost:3000`
- Projects: `desktop` (1440 × 900) and `mobile` (360 × 740)
- Parallelism: 2 workers (override with `PLAYWRIGHT_WORKERS=<n>`)
- Retries: 0
- Reuses an already-running server if available

---

## Keyboard Navigation

| Shortcut                    | Action                                           |
| --------------------------- | ------------------------------------------------ |
| `F6` / `Shift+F6`           | Cycle focus: Editor → Preview → Analysis         |
| `Ctrl/Cmd+Enter`            | Trigger a manual re-scan from anywhere           |
| `Esc`                       | Exit a maximised pane back to split view         |
| `Esc` (in editor)           | Move focus out of CodeMirror to the next element |
| `Tab` (after Esc in editor) | Continue normal tab navigation                   |

Keyboard shortcuts forwarded from inside the preview iframe (`F6`, `Ctrl+Enter`, `Esc`) are validated as `shortcut` messages before the host acts on them.

---

## Git Hooks

`npm run prepare` installs Husky. The pre-commit hook runs `lint-staged`, which applies ESLint and Prettier to staged files before every commit.
