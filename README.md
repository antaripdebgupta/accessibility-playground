# Accessibility Playground

Accessibility Playground is an interactive developer tool designed for frontend engineers and QA professionals to learn, test, and master WCAG 2.2 accessibility patterns. By rendering user-provided HTML into an isolated sandbox, the tool translates invisible accessibility concepts—computed accessibility trees, WAI-ARIA role semantics, accessible name computation traces, and automated `axe-core` violations—into clear, inspectable diagnostics alongside a verified pattern library and color contrast engine.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19, Accessly UI (`@accessly-ui/react`, `@accessly-ui/tailwind-preset`, `@accessly-ui/primitives`, `@accessly-ui/utils`)
- **Styling**: Tailwind CSS v4 with custom semantic tokens for high-contrast dark/light modes
- **Accessibility Engine**: `axe-core` v4.14 (vendored locally in `public/axe.min.js`)
- **Schema Validation**: Zod v4 (runtime iframe `postMessage` protocol validation)
- **Icons**: `lucide-react`
- **Language & Tooling**: TypeScript strict mode, ESLint 9 (flat config) with `eslint-plugin-jsx-a11y`, Prettier with `prettier-plugin-tailwindcss`, Husky, `lint-staged`

---

## Prerequisites

- Node.js 20.x or later (tested on Node.js 22.x)
- npm 10.x or later

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/accessibility-playground.git
cd accessibility-playground
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start

```bash
npm run build
npm run start
```

---

## Available Scripts

| Script                 | Command                                                     | Purpose                                        |
| ---------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `npm run dev`          | `next dev`                                                  | Starts local development server with Turbopack |
| `npm run build`        | `next build`                                                | Builds optimized production output             |
| `npm run start`        | `next start`                                                | Runs the production build locally              |
| `npm run lint`         | `eslint`                                                    | Runs ESLint 9 checks including jsx-a11y        |
| `npm run lint:fix`     | `eslint --fix`                                              | Automatically fixes auto-fixable ESLint issues |
| `npm run typecheck`    | `tsc --noEmit`                                              | Validates TypeScript strict mode types         |
| `npm run format:check` | `prettier --check .`                                        | Verifies code and Tailwind class formatting    |
| `npm run format`       | `prettier --write .`                                        | Formats all files and sorts Tailwind classes   |
| `npm run check`        | `npm run lint && npm run typecheck && npm run format:check` | Single CI and pre-merge gate command           |
| `npm run prepare`      | `husky`                                                     | Installs Git pre-commit hooks                  |

---

## Architecture & Folder Structure

> **Rule:** Browser-only reads (e.g. `localStorage`, `window`) must go through `useSyncExternalStore` or live under an `ssr:false` boundary.

```
├── public/                # Static assets, including vendored axe.min.js
├── src/
│   ├── app/               # Next.js App Router routes, layouts, error, and loading states
│   │   ├── (site)/        # Public routes: home (/), /about, /contrast
│   │   └── (workbench)/   # Playground route with client-only ssr:false boundary
│   ├── components/        # Shared application components (Header, Footer, ThemeToggle, PanelBoundary)
│   │   ├── ui/            # Shared UI components (Badge, CodeSnippet)
│   │   └── workbench/     # Workbench layout primitives (SplitPane)
│   ├── data/              # Static typed content (WCAG criteria, starter templates, editor snippets)
│   ├── features/          # Feature components (Playground, ContrastChecker)
│   ├── hooks/             # Custom React hooks (useWorkbenchLayout, usePlaygroundDocument, useScanState)
│   ├── lib/               # Pure business logic (AST parser, rules registry, AccName trace, storage, postmessage)
│   └── types/             # Shared TypeScript declarations
```

---

## Sandboxed Preview Architecture

1. **Client-Side AST Parsing**: When HTML is modified in the editor, it is parsed via the browser's native `DOMParser` client-side. Stable `data-a11y-id` attributes are assigned to each element to create a shared identity between the code editor, the live preview, and the analysis panels.
2. **Iframe Sandboxing**: The preview document is rendered inside an `<iframe>` configured strictly with `sandbox="allow-scripts"`. The dangerous `allow-same-origin` token is explicitly omitted, ensuring untrusted markup cannot access cookies, localStorage, session storage, or parent DOM nodes.
3. **Local axe-core Execution**: `axe-core` is vendored directly into `public/axe.min.js`. The iframe loads this local script without external network requests and executes an audit restricted to WCAG 2.0, 2.1, and 2.2 rules.
4. **Zod postMessage Protocol**: Results and click events generated inside the sandboxed iframe are dispatched to the parent window via `postMessage`. The parent validates all received messages against strict Zod schemas (`safeParseIframeMessage`) before trusting or rendering any data.

---

## This Application's Accessibility Commitments

Accessibility Playground adheres to WCAG 2.2 AA standards across every route:

- **Complete Keyboard Operability**: All actions, tab panels, tree rows, and copy buttons are keyboard-navigable. The code editor includes explicit escape instructions.
- **Visible Focus States**: Every interactive control renders a distinct, high-contrast focus ring with visible offset (`:focus-visible`).
- **Skip Navigation**: A skip-to-content link is present as the first focusable element on every page.
- **Non-Color Dependent Indicators**: Every status chip, violation level, and contrast pass/fail result pairs an SVG icon and descriptive text with color.
- **Target Sizes**: Interactive controls satisfy the WCAG 2.2 SC 2.5.8 minimum target dimension of 24 × 24 CSS pixels.
- **Reduced Motion**: Smooth scroll and animated transitions respect operating system `prefers-reduced-motion` settings.

---

## Known Limitations

- **Simulated Screen Reader Output**: The accessible-name trace simulates the W3C AccName 1.2 algorithm. Differences between specific browser and screen reader combinations (e.g. JAWS on Chrome vs. VoiceOver on Safari) may yield slight timing or punctuation differences.
- **Automated Audit Scope**: While `axe-core` catches critical automated violations, automated testing cannot evaluate subjective criteria like focus order logic or color perception context. Manual testing remains required for full compliance.
- **Sandboxed JavaScript Scope**: Scripts written inside the playground run inside the iframe but cannot manipulate external APIs or interact with same-origin resources.

---

## Deployment

The project can be deployed seamlessly on any Node.js hosting environment or static/serverless platform supporting Next.js:

```bash
# Build the production bundle
npm run build

# Start the Node server
npm run start
```
