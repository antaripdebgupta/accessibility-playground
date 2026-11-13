Run npm run test:e2e

> accessibility-playground@0.1.0 test:e2e
> playwright test

Running 322 tests using 1 worker

✓ 1 [desktop] › e2e/a11y.spec.ts:62:7 › 1.1 Responsive Verification › AnalysisTabs triggers share single row, align maximize, and stay visible on keyboard navigation (4.2s)
✓ 2 [desktop] › e2e/a11y.spec.ts:128:7 › 1.1 Responsive Verification › Challenge flow below 1024px at 390px keyboard reachability and accessible names (1.4s)
✓ 3 [desktop] › e2e/a11y.spec.ts:160:7 › 1.1 Responsive Verification › MobilePaneTabs has valid aria-controls, single active tabpanel, and arrow key navigation (994ms)
✓ 4 [desktop] › e2e/a11y.spec.ts:193:7 › 1.1 Responsive Verification › Every route has no horizontal overflow across 320, 390, 768, 1024, 1280 viewports (22.9s)
✓ 5 [desktop] › e2e/a11y.spec.ts:235:7 › 1.2 Automated Axe Checks › Clean context axe checks across public routes and challenge (11.1s)
✓ 6 [desktop] › e2e/a11y.spec.ts:258:7 › 1.2 Automated Axe Checks › Playground analysis tabs axe checks (7.3s)
✓ 7 [desktop] › e2e/a11y.spec.ts:286:7 › 1.2 Automated Axe Checks › Playground issues finding detail and baseline compare axe checks (2.0s)
✘ 8 [desktop] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks (2.8s)
✘ 9 [desktop] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link (6.9s)
✓ 10 [desktop] › e2e/a11y.spec.ts:399:7 › 1.3 Checks Axe Cannot Make › Splitter keyboard operation and dragging alternative (SC 2.5.7) (1.0s)
✓ 11 [desktop] › e2e/a11y.spec.ts:430:7 › 1.3 Checks Axe Cannot Make › Interactive target size audit on mobile 390px (SC 2.5.8) (1.1s)
✓ 12 [desktop] › e2e/a11y.spec.ts:484:7 › 1.3 Checks Axe Cannot Make › Zoom emulation and text spacing bookmarklet resilience (1.1s)
✓ 13 [desktop] › e2e/a11y.spec.ts:518:7 › 1.3 Checks Axe Cannot Make › High contrast and reduced motion emulation (985ms)
✓ 14 [desktop] › e2e/a11y.spec.ts:538:7 › 1.3 Checks Axe Cannot Make › Metadata, headings, landmarks, and preview iframe accessibility (5.3s)
✓ 15 [desktop] › e2e/analysis-tabs.spec.ts:5:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Desktop 1280px: all 8 tabs share the same Y position (strictly 1 row) and Maximize button is aligned (998ms)
✓ 16 [desktop] › e2e/analysis-tabs.spec.ts:44:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Mobile 390px and 320px: tabs strip scrolls, accessible names contain full label, and active tab is visible (2.0s)
✓ 17 [desktop] › e2e/analysis-tabs.spec.ts:100:7 › PART A — Analysis Tabs Responsiveness and Accessibility › MobilePaneTabs: roving tabindex, arrow navigation, and tabpanel linking (966ms)
✓ 18 [desktop] › e2e/analysis-tabs.spec.ts:133:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Axe accessibility test on /playground with each Analysis tab selected (4.0s)
✓ 19 [desktop] › e2e/editor.spec.ts:4:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › typing rapidly does not drop characters or introduce corruption (1.1s)
✓ 20 [desktop] › e2e/editor.spec.ts:28:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › first load shows the default document (950ms)
✓ 21 [desktop] › e2e/editor.spec.ts:36:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › Start Fresh and Reset Example restore default document (1.4s)
✓ 22 [desktop] › e2e/editor.spec.ts:78:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › /playground?pattern=anything opens the default document without errors (952ms)
✓ 23 [desktop] › e2e/editor.spec.ts:91:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › no element named Templates exists and Cmd/Ctrl+K does not open any menu (976ms)
✓ 24 [desktop] › e2e/editor.spec.ts:111:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › applying an ARIA edit from ARIA Explorer preserves caret position (1.9s)
✓ 25 [desktop] › e2e/hydration.spec.ts:3:5 › playground hydrates cleanly with a restored session (421ms)
✓ 26 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: semantic-html › code examples are readable on dark blocks (1.2s)
✓ 27 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: accessible-names › code examples are readable on dark blocks (1.2s)
✓ 28 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: aria › code examples are readable on dark blocks (1.1s)
✓ 29 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: keyboard › code examples are readable on dark blocks (1.2s)
✓ 30 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: focus › code examples are readable on dark blocks (1.2s)
✓ 31 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: forms › code examples are readable on dark blocks (1.2s)
✓ 32 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: contrast › code examples are readable on dark blocks (1.2s)
✓ 33 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: images › code examples are readable on dark blocks (1.1s)
✓ 34 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: tables › code examples are readable on dark blocks (1.2s)
✓ 35 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: dialogs › code examples are readable on dark blocks (1.1s)
✓ 36 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: navigation › code examples are readable on dark blocks (1.2s)
✓ 37 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: dynamic-content › code examples are readable on dark blocks (1.2s)
✓ 38 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: screen-readers › code examples are readable on dark blocks (1.2s)
✓ 39 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: reflow › code examples are readable on dark blocks (1.1s)
✓ 40 [desktop] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: motion › code examples are readable on dark blocks (1.1s)
✓ 41 [desktop] › e2e/monitoring.spec.ts:4:7 › Monitoring and Error Reporting Endpoints › GET /api/health returns 200 with status ok and version (24ms)
[WebServer] [ClientErrorReport] {"name":"TypeError","message":"Cannot read property of undefined","route":"/playground","version":"0.1.0","timestamp":"2026-11-13T04:12:30.617Z","context":{"rule":"img-missing-alt","panel":"editor"}}
✓ 42 [desktop] › e2e/monitoring.spec.ts:19:7 › Monitoring and Error Reporting Endpoints › POST /api/report accepts valid scrubbed client error report (9ms)
✓ 43 [desktop] › e2e/monitoring.spec.ts:43:7 › Monitoring and Error Reporting Endpoints › POST /api/report rejects report containing query parameters in route with 400 (6ms)
✓ 44 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 1280px fits viewport and does not exceed 68px height (734ms)
✓ 45 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 1024px fits viewport and does not exceed 68px height (748ms)
✓ 46 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 900px fits viewport and does not exceed 68px height (748ms)
✓ 47 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 768px fits viewport and does not exceed 68px height (728ms)
✓ 48 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 640px fits viewport and does not exceed 68px height (721ms)
✓ 49 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 390px fits viewport and does not exceed 68px height (730ms)
✓ 50 [desktop] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 320px fits viewport and does not exceed 68px height (741ms)
✓ 51 [desktop] › e2e/responsive-headers.spec.ts:68:7 › TASK 1A — Site Header Responsiveness › Disclosure menu interactions on mobile (open, close, Esc, click outside) (799ms)
✓ 52 [desktop] › e2e/responsive-headers.spec.ts:102:7 › TASK 1A — Site Header Responsiveness › Axe accessibility test on '/' and '/contrast' with menu open and closed (3.0s)
✓ 53 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 1280px has no horizontal page scroll (962ms)
✓ 54 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 1024px has no horizontal page scroll (950ms)
✓ 55 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 900px has no horizontal page scroll (938ms)
✓ 56 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 768px has no horizontal page scroll (929ms)
✓ 57 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 640px has no horizontal page scroll (942ms)
✓ 58 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 390px has no horizontal page scroll (1.1s)
✓ 59 [desktop] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 320px has no horizontal page scroll (1.1s)
✓ 60 [desktop] › e2e/responsive-headers.spec.ts:193:7 › TASK 1B — Playground Toolbar Responsiveness › Workbench toolbar at 320px reaches all actions via More menu (1.2s)
✓ 61 [desktop] › e2e/responsive-headers.spec.ts:235:7 › TASK 1B — Playground Toolbar Responsiveness › Axe scan on /playground at 320px with toolbar (1.5s)
✓ 62 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 320px has no horizontal overflow (777ms)
✓ 63 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 360px has no horizontal overflow (713ms)
✓ 64 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 390px has no horizontal overflow (685ms)
✓ 65 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 768px has no horizontal overflow (705ms)
✓ 66 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 1024px has no horizontal overflow (724ms)
✓ 67 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 1280px has no horizontal overflow (705ms)
✓ 68 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 320px has no horizontal overflow (688ms)
✓ 69 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 360px has no horizontal overflow (696ms)
✓ 70 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 390px has no horizontal overflow (692ms)
✓ 71 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 768px has no horizontal overflow (683ms)
✓ 72 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 1024px has no horizontal overflow (702ms)
✓ 73 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 1280px has no horizontal overflow (714ms)
✓ 74 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 320px has no horizontal overflow (739ms)
✓ 75 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 360px has no horizontal overflow (730ms)
✓ 76 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 390px has no horizontal overflow (732ms)
✓ 77 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 768px has no horizontal overflow (721ms)
✓ 78 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 1024px has no horizontal overflow (753ms)
✓ 79 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 1280px has no horizontal overflow (743ms)
✓ 80 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 320px has no horizontal overflow (701ms)
✓ 81 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 360px has no horizontal overflow (734ms)
✓ 82 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 390px has no horizontal overflow (733ms)
✓ 83 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 768px has no horizontal overflow (778ms)
✓ 84 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 1024px has no horizontal overflow (858ms)
✓ 85 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 1280px has no horizontal overflow (812ms)
✓ 86 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 320px has no horizontal overflow (752ms)
✓ 87 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 360px has no horizontal overflow (752ms)
✓ 88 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 390px has no horizontal overflow (797ms)
✓ 89 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 768px has no horizontal overflow (749ms)
✓ 90 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 1024px has no horizontal overflow (741ms)
✓ 91 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 1280px has no horizontal overflow (773ms)
✓ 92 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 320px has no horizontal overflow (707ms)
✓ 93 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 360px has no horizontal overflow (682ms)
✓ 94 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 390px has no horizontal overflow (690ms)
✓ 95 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 768px has no horizontal overflow (690ms)
✓ 96 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 1024px has no horizontal overflow (716ms)
✓ 97 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 1280px has no horizontal overflow (715ms)
✓ 98 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 320px has no horizontal overflow (676ms)
✓ 99 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 360px has no horizontal overflow (704ms)
✓ 100 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 390px has no horizontal overflow (701ms)
✓ 101 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 768px has no horizontal overflow (690ms)
✓ 102 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 1024px has no horizontal overflow (718ms)
✓ 103 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 1280px has no horizontal overflow (732ms)
✓ 104 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 320px has no horizontal overflow (691ms)
✓ 105 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 360px has no horizontal overflow (683ms)
✓ 106 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 390px has no horizontal overflow (693ms)
✓ 107 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 768px has no horizontal overflow (696ms)
✓ 108 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 1024px has no horizontal overflow (714ms)
✓ 109 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 1280px has no horizontal overflow (712ms)
✓ 110 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 320px has no horizontal overflow (931ms)
✓ 111 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 360px has no horizontal overflow (917ms)
✓ 112 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 390px has no horizontal overflow (1.1s)
✓ 113 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 768px has no horizontal overflow (934ms)
✓ 114 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 1024px has no horizontal overflow (935ms)
✓ 115 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 1280px has no horizontal overflow (1.1s)
✓ 116 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 320px has no horizontal overflow (1.3s)
✓ 117 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 360px has no horizontal overflow (1.5s)
✓ 118 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 390px has no horizontal overflow (1.5s)
✓ 119 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 768px has no horizontal overflow (1.3s)
✓ 120 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 1024px has no horizontal overflow (1.4s)
✓ 121 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 1280px has no horizontal overflow (1.4s)
✓ 122 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 320px has no horizontal overflow (912ms)
✓ 123 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 360px has no horizontal overflow (913ms)
✓ 124 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 390px has no horizontal overflow (910ms)
✓ 125 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 768px has no horizontal overflow (915ms)
✓ 126 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 1024px has no horizontal overflow (935ms)
✓ 127 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 1280px has no horizontal overflow (937ms)
✓ 128 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 320px has no horizontal overflow (689ms)
✓ 129 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 360px has no horizontal overflow (670ms)
✓ 130 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 390px has no horizontal overflow (667ms)
✓ 131 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 768px has no horizontal overflow (680ms)
✓ 132 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 1024px has no horizontal overflow (676ms)
✓ 133 [desktop] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 1280px has no horizontal overflow (668ms)
✓ 134 [desktop] › e2e/responsive.spec.ts:88:7 › Responsive Audit & Measurement › Zoom emulation at 320px with 200% and 400% scale (6.6s)
✓ 135 [desktop] › e2e/responsive.spec.ts:118:7 › Responsive Audit & Measurement › Feature reachability on mobile 320px viewport (1.7s)
✓ 136 [desktop] › e2e/responsive.spec.ts:183:7 › Responsive Audit & Measurement › Axe accessibility checks across widths for main routes (25.1s)
✓ 137 [desktop] › e2e/security.spec.ts:5:7 › Security Headers & Isolation (acc.md Part 2) › enforces strict security headers on site routes (78ms)
✓ 138 [desktop] › e2e/security.spec.ts:55:7 › Security Headers & Isolation (acc.md Part 2) › serves /preview-frame with dedicated relaxed preview CSP and sameorigin framing (7ms)
✓ 139 [desktop] › e2e/security.spec.ts:73:7 › Security Headers & Isolation (acc.md Part 2) › serves /axe.min.js with immutable long cache and same-origin resource policy (20ms)
✘ 140 [desktop] › e2e/security.spec.ts:86:7 › Security Headers & Isolation (acc.md Part 2) › exercises playground workflows with zero CSP violations (1.6s)
✓ 141 [desktop] › e2e/security.spec.ts:193:7 › Security Headers & Isolation (acc.md Part 2) › isolates hostile payload in sandboxed iframe and prevents parent origin compromise (514ms)
✓ 142 [desktop] › e2e/seo.spec.ts:4:7 › SEO and Sharing Endpoints › GET /robots.txt returns valid robots content and references sitemap (25ms)
✓ 143 [desktop] › e2e/seo.spec.ts:20:7 › SEO and Sharing Endpoints › GET /sitemap.xml returns valid xml containing public routes and no query strings (32ms)
✓ 144 [desktop] › e2e/seo.spec.ts:50:7 › SEO and Sharing Endpoints › GET /manifest.webmanifest returns valid web manifest (15ms)
✓ 145 [desktop] › e2e/seo.spec.ts:67:7 › SEO and Sharing Endpoints › Shared playground URL includes noindex robots meta tag (212ms)
✓ 146 [desktop] › e2e/seo.spec.ts:81:7 › SEO and Sharing Endpoints › Public routes have title, description, and do not have noindex (665ms)
✓ 147 [desktop] › e2e/seo.spec.ts:115:7 › SEO and Sharing Endpoints › Structured data JSON-LD is truthful and parses correctly (278ms)
✓ 148 [desktop] › e2e/smoke.spec.ts:16:9 › Route: / › has 0 WCAG 2.2 AA axe violations (1.3s)
✓ 149 [desktop] › e2e/smoke.spec.ts:16:9 › Route: /about › has 0 WCAG 2.2 AA axe violations (1.2s)
✓ 150 [desktop] › e2e/smoke.spec.ts:16:9 › Route: /contrast › has 0 WCAG 2.2 AA axe violations (1.2s)
✓ 151 [desktop] › e2e/smoke.spec.ts:16:9 › Route: /learn › has 0 WCAG 2.2 AA axe violations (1.4s)
✓ 152 [desktop] › e2e/smoke.spec.ts:16:9 › Route: /challenges › has 0 WCAG 2.2 AA axe violations (1.3s)
✓ 153 [desktop] › e2e/smoke.spec.ts:16:9 › Route: /playground › has 0 WCAG 2.2 AA axe violations (1.9s)
✓ 154 [desktop] › e2e/smoke.spec.ts:43:9 › Site Nav: / › header has exactly one nav landmark with all 3 items (240ms)
✓ 155 [desktop] › e2e/smoke.spec.ts:43:9 › Site Nav: /contrast › header has exactly one nav landmark with all 3 items (252ms)
✓ 156 [desktop] › e2e/smoke.spec.ts:43:9 › Site Nav: /about › header has exactly one nav landmark with all 3 items (251ms)
✓ 157 [desktop] › e2e/smoke.spec.ts:67:7 › Workbench chrome-less shell › /playground has no marketing nav or footer, but has workbench toolbar (407ms)
✓ 158 [desktop] › e2e/smoke.spec.ts:89:7 › Footer landmark › footer landmark exists only on home route ('/') (243ms)
✓ 159 [desktop] › e2e/smoke.spec.ts:99:7 › Item 2: Rescan button keyboard focus and aria-disabled › focus Rescan, press Enter -> activeElement remains Rescan button during and after scan (1.0s)
✓ 160 [desktop] › e2e/splitter.spec.ts:4:7 › Workbench Splitters › separator is keyboard resizable (472ms)
✓ 161 [desktop] › e2e/splitter.spec.ts:17:7 › Workbench Splitters › F6 cycles focus between panes (170ms)
✓ 162 [mobile] › e2e/a11y.spec.ts:62:7 › 1.1 Responsive Verification › AnalysisTabs triggers share single row, align maximize, and stay visible on keyboard navigation (4.3s)
✓ 163 [mobile] › e2e/a11y.spec.ts:128:7 › 1.1 Responsive Verification › Challenge flow below 1024px at 390px keyboard reachability and accessible names (1.4s)
✓ 164 [mobile] › e2e/a11y.spec.ts:160:7 › 1.1 Responsive Verification › MobilePaneTabs has valid aria-controls, single active tabpanel, and arrow key navigation (996ms)
✓ 165 [mobile] › e2e/a11y.spec.ts:193:7 › 1.1 Responsive Verification › Every route has no horizontal overflow across 320, 390, 768, 1024, 1280 viewports (23.1s)
✓ 166 [mobile] › e2e/a11y.spec.ts:235:7 › 1.2 Automated Axe Checks › Clean context axe checks across public routes and challenge (10.6s)
✓ 167 [mobile] › e2e/a11y.spec.ts:258:7 › 1.2 Automated Axe Checks › Playground analysis tabs axe checks (7.5s)
✓ 168 [mobile] › e2e/a11y.spec.ts:286:7 › 1.2 Automated Axe Checks › Playground issues finding detail and baseline compare axe checks (2.0s)
✘ 169 [mobile] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks (2.8s)
✘ 170 [mobile] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link (6.8s)
✓ 171 [mobile] › e2e/a11y.spec.ts:399:7 › 1.3 Checks Axe Cannot Make › Splitter keyboard operation and dragging alternative (SC 2.5.7) (77ms)
✓ 172 [mobile] › e2e/a11y.spec.ts:430:7 › 1.3 Checks Axe Cannot Make › Interactive target size audit on mobile 390px (SC 2.5.8) (1.1s)
✓ 173 [mobile] › e2e/a11y.spec.ts:484:7 › 1.3 Checks Axe Cannot Make › Zoom emulation and text spacing bookmarklet resilience (1.1s)
✓ 174 [mobile] › e2e/a11y.spec.ts:518:7 › 1.3 Checks Axe Cannot Make › High contrast and reduced motion emulation (997ms)
✓ 175 [mobile] › e2e/a11y.spec.ts:538:7 › 1.3 Checks Axe Cannot Make › Metadata, headings, landmarks, and preview iframe accessibility (5.1s)
✓ 176 [mobile] › e2e/analysis-tabs.spec.ts:5:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Desktop 1280px: all 8 tabs share the same Y position (strictly 1 row) and Maximize button is aligned (1.0s)
✓ 177 [mobile] › e2e/analysis-tabs.spec.ts:44:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Mobile 390px and 320px: tabs strip scrolls, accessible names contain full label, and active tab is visible (2.0s)
✓ 178 [mobile] › e2e/analysis-tabs.spec.ts:100:7 › PART A — Analysis Tabs Responsiveness and Accessibility › MobilePaneTabs: roving tabindex, arrow navigation, and tabpanel linking (1.0s)
✓ 179 [mobile] › e2e/analysis-tabs.spec.ts:133:7 › PART A — Analysis Tabs Responsiveness and Accessibility › Axe accessibility test on /playground with each Analysis tab selected (4.0s)
✓ 180 [mobile] › e2e/editor.spec.ts:4:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › typing rapidly does not drop characters or introduce corruption (1.1s)
✓ 181 [mobile] › e2e/editor.spec.ts:28:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › first load shows the default document (939ms)
✓ 182 [mobile] › e2e/editor.spec.ts:36:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › Start Fresh and Reset Example restore default document (1.1s)
✓ 183 [mobile] › e2e/editor.spec.ts:78:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › /playground?pattern=anything opens the default document without errors (930ms)
✓ 184 [mobile] › e2e/editor.spec.ts:91:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › no element named Templates exists and Cmd/Ctrl+K does not open any menu (973ms)
✓ 185 [mobile] › e2e/editor.spec.ts:111:7 › Editor Typing and Replacement Robustness (§B.6, §A.5) › applying an ARIA edit from ARIA Explorer preserves caret position (1.1s)
✓ 186 [mobile] › e2e/hydration.spec.ts:3:5 › playground hydrates cleanly with a restored session (434ms)
✓ 187 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: semantic-html › code examples are readable on dark blocks (1.2s)
✓ 188 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: accessible-names › code examples are readable on dark blocks (1.2s)
✓ 189 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: aria › code examples are readable on dark blocks (1.1s)
✓ 190 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: keyboard › code examples are readable on dark blocks (1.2s)
✓ 191 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: focus › code examples are readable on dark blocks (1.2s)
✓ 192 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: forms › code examples are readable on dark blocks (1.2s)
✓ 193 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: contrast › code examples are readable on dark blocks (1.2s)
✓ 194 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: images › code examples are readable on dark blocks (1.1s)
✓ 195 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: tables › code examples are readable on dark blocks (1.1s)
✓ 196 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: dialogs › code examples are readable on dark blocks (1.2s)
✓ 197 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: navigation › code examples are readable on dark blocks (1.2s)
✓ 198 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: dynamic-content › code examples are readable on dark blocks (1.2s)
✓ 199 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: screen-readers › code examples are readable on dark blocks (1.2s)
✓ 200 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: reflow › code examples are readable on dark blocks (1.1s)
✓ 201 [mobile] › e2e/learn-code-blocks.spec.ts:7:9 › Learn topic: motion › code examples are readable on dark blocks (1.1s)
✓ 202 [mobile] › e2e/monitoring.spec.ts:4:7 › Monitoring and Error Reporting Endpoints › GET /api/health returns 200 with status ok and version (19ms)
[WebServer] [ClientErrorReport] {"name":"TypeError","message":"Cannot read property of undefined","route":"/playground","version":"0.1.0","timestamp":"2026-11-13T04:16:19.254Z","context":{"rule":"img-missing-alt","panel":"editor"}}
✓ 203 [mobile] › e2e/monitoring.spec.ts:19:7 › Monitoring and Error Reporting Endpoints › POST /api/report accepts valid scrubbed client error report (7ms)
✓ 204 [mobile] › e2e/monitoring.spec.ts:43:7 › Monitoring and Error Reporting Endpoints › POST /api/report rejects report containing query parameters in route with 400 (7ms)
✓ 205 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 1280px fits viewport and does not exceed 68px height (746ms)
✓ 206 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 1024px fits viewport and does not exceed 68px height (744ms)
✓ 207 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 900px fits viewport and does not exceed 68px height (749ms)
✓ 208 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 768px fits viewport and does not exceed 68px height (764ms)
✓ 209 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 640px fits viewport and does not exceed 68px height (743ms)
✓ 210 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 390px fits viewport and does not exceed 68px height (753ms)
✓ 211 [mobile] › e2e/responsive-headers.spec.ts:8:9 › TASK 1A — Site Header Responsiveness › Header on '/' at 320px fits viewport and does not exceed 68px height (750ms)
✓ 212 [mobile] › e2e/responsive-headers.spec.ts:68:7 › TASK 1A — Site Header Responsiveness › Disclosure menu interactions on mobile (open, close, Esc, click outside) (806ms)
✓ 213 [mobile] › e2e/responsive-headers.spec.ts:102:7 › TASK 1A — Site Header Responsiveness › Axe accessibility test on '/' and '/contrast' with menu open and closed (2.9s)
✓ 214 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 1280px has no horizontal page scroll (967ms)
✓ 215 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 1024px has no horizontal page scroll (976ms)
✓ 216 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 900px has no horizontal page scroll (943ms)
✓ 217 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 768px has no horizontal page scroll (956ms)
✓ 218 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 640px has no horizontal page scroll (951ms)
✓ 219 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 390px has no horizontal page scroll (950ms)
✓ 220 [mobile] › e2e/responsive-headers.spec.ts:146:9 › TASK 1B — Playground Toolbar Responsiveness › WorkbenchToolbar at 320px has no horizontal page scroll (951ms)
✓ 221 [mobile] › e2e/responsive-headers.spec.ts:193:7 › TASK 1B — Playground Toolbar Responsiveness › Workbench toolbar at 320px reaches all actions via More menu (1.2s)
✓ 222 [mobile] › e2e/responsive-headers.spec.ts:235:7 › TASK 1B — Playground Toolbar Responsiveness › Axe scan on /playground at 320px with toolbar (1.5s)
✓ 223 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 320px has no horizontal overflow (701ms)
✓ 224 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 360px has no horizontal overflow (700ms)
✓ 225 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 390px has no horizontal overflow (704ms)
✓ 226 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 768px has no horizontal overflow (697ms)
✓ 227 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 1024px has no horizontal overflow (719ms)
✓ 228 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › / @ 1280px has no horizontal overflow (726ms)
✓ 229 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 320px has no horizontal overflow (685ms)
✓ 230 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 360px has no horizontal overflow (679ms)
✓ 231 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 390px has no horizontal overflow (688ms)
✓ 232 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 768px has no horizontal overflow (694ms)
✓ 233 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 1024px has no horizontal overflow (714ms)
✓ 234 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /about @ 1280px has no horizontal overflow (728ms)
✓ 235 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 320px has no horizontal overflow (710ms)
✓ 236 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 360px has no horizontal overflow (728ms)
✓ 237 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 390px has no horizontal overflow (747ms)
✓ 238 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 768px has no horizontal overflow (728ms)
✓ 239 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 1024px has no horizontal overflow (753ms)
✓ 240 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges @ 1280px has no horizontal overflow (762ms)
✓ 241 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 320px has no horizontal overflow (735ms)
✓ 242 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 360px has no horizontal overflow (707ms)
✓ 243 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 390px has no horizontal overflow (713ms)
✓ 244 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 768px has no horizontal overflow (725ms)
✓ 245 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 1024px has no horizontal overflow (741ms)
✓ 246 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /challenges?difficulty=beginner @ 1280px has no horizontal overflow (749ms)
✓ 247 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 320px has no horizontal overflow (703ms)
✓ 248 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 360px has no horizontal overflow (711ms)
✓ 249 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 390px has no horizontal overflow (699ms)
✓ 250 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 768px has no horizontal overflow (709ms)
✓ 251 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 1024px has no horizontal overflow (725ms)
✓ 252 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn @ 1280px has no horizontal overflow (752ms)
✓ 253 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 320px has no horizontal overflow (708ms)
✓ 254 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 360px has no horizontal overflow (686ms)
✓ 255 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 390px has no horizontal overflow (688ms)
✓ 256 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 768px has no horizontal overflow (689ms)
✓ 257 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 1024px has no horizontal overflow (733ms)
✓ 258 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/semantic-html @ 1280px has no horizontal overflow (709ms)
✓ 259 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 320px has no horizontal overflow (684ms)
✓ 260 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 360px has no horizontal overflow (691ms)
✓ 261 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 390px has no horizontal overflow (690ms)
✓ 262 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 768px has no horizontal overflow (700ms)
✓ 263 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 1024px has no horizontal overflow (707ms)
✓ 264 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /learn/aria @ 1280px has no horizontal overflow (708ms)
✓ 265 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 320px has no horizontal overflow (694ms)
✓ 266 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 360px has no horizontal overflow (685ms)
✓ 267 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 390px has no horizontal overflow (692ms)
✓ 268 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 768px has no horizontal overflow (688ms)
✓ 269 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 1024px has no horizontal overflow (709ms)
✓ 270 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /contrast @ 1280px has no horizontal overflow (703ms)
✓ 271 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 320px has no horizontal overflow (915ms)
✓ 272 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 360px has no horizontal overflow (926ms)
✓ 273 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 390px has no horizontal overflow (917ms)
✓ 274 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 768px has no horizontal overflow (1.1s)
✓ 275 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 1024px has no horizontal overflow (953ms)
✓ 276 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground @ 1280px has no horizontal overflow (958ms)
✓ 277 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 320px has no horizontal overflow (1.4s)
✓ 278 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 360px has no horizontal overflow (1.3s)
✓ 279 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 390px has no horizontal overflow (1.3s)
✓ 280 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 768px has no horizontal overflow (1.5s)
✓ 281 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 1024px has no horizontal overflow (1.4s)
✓ 282 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?challenge=image-alt @ 1280px has no horizontal overflow (1.4s)
✓ 283 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 320px has no horizontal overflow (923ms)
✓ 284 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 360px has no horizontal overflow (921ms)
✓ 285 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 390px has no horizontal overflow (930ms)
✓ 286 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 768px has no horizontal overflow (938ms)
✓ 287 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 1024px has no horizontal overflow (937ms)
✓ 288 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /playground?s=eyJ7IjoiPGgxPkhlbGxvPC9oMT4iLCJjIjoiIn0= @ 1280px has no horizontal overflow (942ms)
✓ 289 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 320px has no horizontal overflow (673ms)
✓ 290 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 360px has no horizontal overflow (679ms)
✓ 291 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 390px has no horizontal overflow (714ms)
✓ 292 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 768px has no horizontal overflow (660ms)
✓ 293 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 1024px has no horizontal overflow (669ms)
✓ 294 [mobile] › e2e/responsive.spec.ts:40:11 › Responsive Audit & Measurement › /not-found-test @ 1280px has no horizontal overflow (667ms)
✓ 295 [mobile] › e2e/responsive.spec.ts:88:7 › Responsive Audit & Measurement › Zoom emulation at 320px with 200% and 400% scale (6.5s)
✓ 296 [mobile] › e2e/responsive.spec.ts:118:7 › Responsive Audit & Measurement › Feature reachability on mobile 320px viewport (1.6s)
✓ 297 [mobile] › e2e/responsive.spec.ts:183:7 › Responsive Audit & Measurement › Axe accessibility checks across widths for main routes (24.5s)
✓ 298 [mobile] › e2e/security.spec.ts:5:7 › Security Headers & Isolation (acc.md Part 2) › enforces strict security headers on site routes (52ms)
✓ 299 [mobile] › e2e/security.spec.ts:55:7 › Security Headers & Isolation (acc.md Part 2) › serves /preview-frame with dedicated relaxed preview CSP and sameorigin framing (5ms)
✓ 300 [mobile] › e2e/security.spec.ts:73:7 › Security Headers & Isolation (acc.md Part 2) › serves /axe.min.js with immutable long cache and same-origin resource policy (15ms)
✓ 301 [mobile] › e2e/security.spec.ts:86:7 › Security Headers & Isolation (acc.md Part 2) › exercises playground workflows with zero CSP violations (750ms)
✓ 302 [mobile] › e2e/security.spec.ts:193:7 › Security Headers & Isolation (acc.md Part 2) › isolates hostile payload in sandboxed iframe and prevents parent origin compromise (1.0s)
✓ 303 [mobile] › e2e/seo.spec.ts:4:7 › SEO and Sharing Endpoints › GET /robots.txt returns valid robots content and references sitemap (7ms)
✓ 304 [mobile] › e2e/seo.spec.ts:20:7 › SEO and Sharing Endpoints › GET /sitemap.xml returns valid xml containing public routes and no query strings (6ms)
✓ 305 [mobile] › e2e/seo.spec.ts:50:7 › SEO and Sharing Endpoints › GET /manifest.webmanifest returns valid web manifest (4ms)
✓ 306 [mobile] › e2e/seo.spec.ts:67:7 › SEO and Sharing Endpoints › Shared playground URL includes noindex robots meta tag (170ms)
✓ 307 [mobile] › e2e/seo.spec.ts:81:7 › SEO and Sharing Endpoints › Public routes have title, description, and do not have noindex (507ms)
✓ 308 [mobile] › e2e/seo.spec.ts:115:7 › SEO and Sharing Endpoints › Structured data JSON-LD is truthful and parses correctly (237ms)
✓ 309 [mobile] › e2e/smoke.spec.ts:16:9 › Route: / › has 0 WCAG 2.2 AA axe violations (1.1s)
✓ 310 [mobile] › e2e/smoke.spec.ts:16:9 › Route: /about › has 0 WCAG 2.2 AA axe violations (1.1s)
✓ 311 [mobile] › e2e/smoke.spec.ts:16:9 › Route: /contrast › has 0 WCAG 2.2 AA axe violations (1.1s)
✓ 312 [mobile] › e2e/smoke.spec.ts:16:9 › Route: /learn › has 0 WCAG 2.2 AA axe violations (1.3s)
✓ 313 [mobile] › e2e/smoke.spec.ts:16:9 › Route: /challenges › has 0 WCAG 2.2 AA axe violations (1.2s)
✓ 314 [mobile] › e2e/smoke.spec.ts:16:9 › Route: /playground › has 0 WCAG 2.2 AA axe violations (1.4s)
✓ 315 [mobile] › e2e/smoke.spec.ts:43:9 › Site Nav: / › header has exactly one nav landmark with all 3 items (199ms)
✓ 316 [mobile] › e2e/smoke.spec.ts:43:9 › Site Nav: /contrast › header has exactly one nav landmark with all 3 items (230ms)
✓ 317 [mobile] › e2e/smoke.spec.ts:43:9 › Site Nav: /about › header has exactly one nav landmark with all 3 items (181ms)
✓ 318 [mobile] › e2e/smoke.spec.ts:67:7 › Workbench chrome-less shell › /playground has no marketing nav or footer, but has workbench toolbar (402ms)
✓ 319 [mobile] › e2e/smoke.spec.ts:89:7 › Footer landmark › footer landmark exists only on home route ('/') (217ms)
✓ 320 [mobile] › e2e/smoke.spec.ts:99:7 › Item 2: Rescan button keyboard focus and aria-disabled › focus Rescan, press Enter -> activeElement remains Rescan button during and after scan (932ms)
✓ 321 [mobile] › e2e/splitter.spec.ts:4:7 › Workbench Splitters › separator is keyboard resizable (28ms)
✓ 322 [mobile] › e2e/splitter.spec.ts:17:7 › Workbench Splitters › F6 cycles focus between panes (163ms)

1.   [desktop] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks

    Error: Axe violations found in Snippets menu open:

    [critical] aria-required-children: Certain ARIA roles must contain particular children (#dropdown-menu-_r_a_-content)
    [serious] color-contrast: Elements must meet minimum color contrast ratio thresholds (.bg-\[var\(--color-accent-subtle\)\])

    expect(received).toEqual(expected) // deep equality

    - Expected  -   1
    + Received  + 118

    - Array []
    + Array [
    +   Object {
    +     "description": "Ensure elements with an ARIA role that require child roles contain them",
    +     "help": "Certain ARIA roles must contain particular children",
    +     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-required-children?application=playwright",
    +     "id": "aria-required-children",
    +     "impact": "critical",
    +     "nodes": Array [
    +       Object {
    +         "all": Array [],
    +         "any": Array [
    +           Object {
    +             "data": Object {
    +               "messageKey": "unallowed",
    +               "values": "button",
    +             },
    +             "id": "aria-required-children",
    +             "impact": "critical",
    +             "message": "Element has children which are not allowed: button",
    +             "relatedNodes": Array [
    +               Object {
    +                 "html": "<button type=\"button\" class=\"flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-subtle)]/40 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]\">",
    +                 "target": Array [
    +                   ".hover\\:bg-\\[var\\(--color-accent-subtle\\)\\]\\/40",
    +                 ],
    +               },
    +               Object {
    +                 "html": "<button type=\"button\" class=\"inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]\">",
    +                 "target": Array [
    +                   ".text-\\[11px\\].gap-1.hover\\:text-\\[var\\(--color-text-primary\\)\\]:nth-child(2)",
    +                 ],
    +               },
    +               Object {
    +                 "html": "<button type=\"button\" disabled=\"\" class=\"inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-40\">",
    +                 "target": Array [
    +                   ".disabled\\:opacity-40",
    +                 ],
    +               },
    +             ],
    +           },
    +         ],
    +         "failureSummary": "Fix any of the following:
    +   Element has children which are not allowed: button",
    +         "html": "<div id=\"dropdown-menu-_r_a_-...\" role=\"menu\" aria-labelledby=\"dropdown-menu-_r_a_-...\" tabindex=\"-1\" data-state=\"open\" class=\"popover-surface z-50...\" style=\"position: fixed; tra...\">",
    +         "impact": "critical",
    +         "none": Array [],
    +         "target": Array [
    +           "#dropdown-menu-_r_a_-content",
    +         ],
    +       },
    +     ],
    +     "tags": Array [
    +       "cat.aria",
    +       "wcag2a",
    +       "wcag131",
    +       "EN-301-549",
    +       "EN-9.1.3.1",
    +       "RGAAv4",
    +       "RGAA-9.3.1",
    +     ],
    +   },
    +   Object {
    +     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    +     "help": "Elements must meet minimum color contrast ratio thresholds",
    +     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
    +     "id": "color-contrast",
    +     "impact": "serious",
    +     "nodes": Array [
    +       Object {
    +         "all": Array [],
    +         "any": Array [
    +           Object {
    +             "data": Object {
    +               "bgColor": "#f1f5fd",
    +               "contrastRatio": 4.26,
    +               "expectedContrastRatio": "4.5:1",
    +               "fgColor": "#456ddf",
    +               "fontSize": "6.8pt (9px)",
    +               "fontWeight": "normal",
    +               "messageKey": null,
    +             },
    +             "id": "color-contrast",
    +             "impact": "serious",
    +             "message": "Element has insufficient color contrast of 4.26 (foreground color: #456ddf, background color: #f1f5fd, font size: 6.8pt (9px), font weight: normal). Expected contrast ratio of 4.5:1",
    +             "relatedNodes": Array [
    +               Object {
    +                 "html": "<span class=\"inline-flex items-center gap-1 rounded border font-mono tracking-tight bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-border)] px-1 py-0 text-[9px] font-normal\">Yours</span>",
    +                 "target": Array [
    +                   ".bg-\\[var\\(--color-accent-subtle\\)\\]",
    +                 ],
    +               },
    +             ],
    +           },
    +         ],
    +         "failureSummary": "Fix any of the following:
    +   Element has insufficient color contrast of 4.26 (foreground color: #456ddf, background color: #f1f5fd, font size: 6.8pt (9px), font weight: normal). Expected contrast ratio of 4.5:1",
    +         "html": "<span class=\"inline-flex items-center gap-1 rounded border font-mono tracking-tight bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-border)] px-1 py-0 text-[9px] font-normal\">Yours</span>",
    +         "impact": "serious",
    +         "none": Array [],
    +         "target": Array [
    +           ".bg-\\[var\\(--color-accent-subtle\\)\\]",
    +         ],
    +       },
    +     ],
    +     "tags": Array [
    +       "cat.color",
    +       "wcag2aa",
    +       "wcag143",
    +       "TTv5",
    +       "TT13.c",
    +       "EN-301-549",
    +       "EN-9.1.4.3",
    +       "ACT",
    +       "RGAAv4",
    +       "RGAA-3.2.1",
    +     ],
    +   },
    + ]

      40 |       filteredViolations,
      41 |       `Axe violations found in ${contextName}:\n${summary}`
    > 42 |     ).toEqual([]);
         |       ^
      43 |   }
      44 | }
      45 |
        at assertAxeClean (/home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:42:7)
        at /home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:353:7

    Error Context: test-results/a11y-1-2-Automated-Axe-Che-ec1d6-nd-mobile-layout-axe-checks-desktop/error-context.md

2) [desktop] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link

    Error: expect(locator).not.toBeFocused() failed

    Locator:  locator('.cm-content')
    Expected: not focused
    Received: focused
    Timeout:  5000ms

    Call log:
      - Expect "not toBeFocused" locator('.cm-content') with timeout 5000ms
      - waiting for locator('.cm-content')
        14 × locator resolved to <div translate="no" role="textbox" autocorrect="off" spellcheck="false" autocapitalize="off" data-language="html" aria-multiline="true" contenteditable="true" aria-autocomplete="list" writingsuggestions="false" aria-label="HTML code editor" class="cm-content cm-lineWrapping">…</div>
           - unexpected value "focused"


      394 |     await page.keyboard.press("Tab");
      395 |     await page.waitForTimeout(100);
    > 396 |     await expect(editorContent).not.toBeFocused();
          |                                     ^
      397 |   });
      398 |
      399 |   test("Splitter keyboard operation and dragging alternative (SC 2.5.7)", async ({
        at /home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:396:37

    Error Context: test-results/a11y-1-3-Checks-Axe-Cannot-bf672-ap-prevention-and-skip-link-desktop/error-context.md

3) [desktop] › e2e/security.spec.ts:86:7 › Security Headers & Isolation (acc.md Part 2) › exercises playground workflows with zero CSP violations

    Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Export' }) resolved to 2 elements:
        1) <button type="button" aria-haspopup="menu" aria-expanded="false" id="dropdown-menu-_r_1_-trigger" aria-label="Export — export accessibility report" class="inline-flex items-center justify-center rounded-control whitespace-nowrap transition-[color,background-color,border-color,box-shadow,scale] duration-fast ease-out-soft focus-ring-safe disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100 aria-disabled:a…>…</button> aka getByRole('button', { name: 'Export — export accessibility' })
        2) <button disabled type="button" class="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-40">…</button> aka getByRole('button', { name: 'Export All' })

    Call log:
      - waiting for getByRole('button', { name: 'Export' })


      153 |     const exportBtn = page.getByRole("button", { name: "Export" });
      154 |     if (await exportBtn.isVisible()) {
    > 155 |       await exportBtn.click();
          |                       ^
      156 |       const exportJson = page.getByRole("menuitem", { name: /json/i }).first();
      157 |       if (await exportJson.isVisible()) {
      158 |         await page.keyboard.press("Escape");
        at /home/runner/work/accessibility-playground/accessibility-playground/e2e/security.spec.ts:155:23

    Error Context: test-results/security-Security-Headers--dc62b-ws-with-zero-CSP-violations-desktop/error-context.md

4) [mobile] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks

    Error: Axe violations found in Snippets menu open:
    [critical] aria-required-children: Certain ARIA roles must contain particular children (#dropdown-menu-_r_a_-content)
    [serious] color-contrast: Elements must meet minimum color contrast ratio thresholds (.bg-\[var\(--color-accent-subtle\)\])

    expect(received).toEqual(expected) // deep equality

    - Expected  -   1
    + Received  + 118

    - Array []
    + Array [
    +   Object {
    +     "description": "Ensure elements with an ARIA role that require child roles contain them",
    +     "help": "Certain ARIA roles must contain particular children",
    +     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/aria-required-children?application=playwright",
    +     "id": "aria-required-children",
    +     "impact": "critical",
    +     "nodes": Array [
    +       Object {
    +         "all": Array [],
    +         "any": Array [
    +           Object {
    +             "data": Object {
    +               "messageKey": "unallowed",
    +               "values": "button",
    +             },
    +             "id": "aria-required-children",
    +             "impact": "critical",
    +             "message": "Element has children which are not allowed: button",
    +             "relatedNodes": Array [
    +               Object {
    +                 "html": "<button type=\"button\" class=\"flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-subtle)]/40 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]\">",
    +                 "target": Array [
    +                   ".hover\\:bg-\\[var\\(--color-accent-subtle\\)\\]\\/40",
    +                 ],
    +               },
    +               Object {
    +                 "html": "<button type=\"button\" class=\"inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]\">",
    +                 "target": Array [
    +                   ".text-\\[11px\\].gap-1.hover\\:text-\\[var\\(--color-text-primary\\)\\]:nth-child(2)",
    +                 ],
    +               },
    +               Object {
    +                 "html": "<button type=\"button\" disabled=\"\" class=\"inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-40\">",
    +                 "target": Array [
    +                   ".disabled\\:opacity-40",
    +                 ],
    +               },
    +             ],
    +           },
    +         ],
    +         "failureSummary": "Fix any of the following:
    +   Element has children which are not allowed: button",
    +         "html": "<div id=\"dropdown-menu-_r_a_-...\" role=\"menu\" aria-labelledby=\"dropdown-menu-_r_a_-...\" tabindex=\"-1\" data-state=\"open\" class=\"popover-surface z-50...\" style=\"position: fixed; tra...\">",
    +         "impact": "critical",
    +         "none": Array [],
    +         "target": Array [
    +           "#dropdown-menu-_r_a_-content",
    +         ],
    +       },
    +     ],
    +     "tags": Array [
    +       "cat.aria",
    +       "wcag2a",
    +       "wcag131",
    +       "EN-301-549",
    +       "EN-9.1.3.1",
    +       "RGAAv4",
    +       "RGAA-9.3.1",
    +     ],
    +   },
    +   Object {
    +     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
    +     "help": "Elements must meet minimum color contrast ratio thresholds",
    +     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
    +     "id": "color-contrast",
    +     "impact": "serious",
    +     "nodes": Array [
    +       Object {
    +         "all": Array [],
    +         "any": Array [
    +           Object {
    +             "data": Object {
    +               "bgColor": "#f1f5fd",
    +               "contrastRatio": 4.27,
    +               "expectedContrastRatio": "4.5:1",
    +               "fgColor": "#446ddf",
    +               "fontSize": "6.8pt (9px)",
    +               "fontWeight": "normal",
    +               "messageKey": null,
    +             },
    +             "id": "color-contrast",
    +             "impact": "serious",
    +             "message": "Element has insufficient color contrast of 4.27 (foreground color: #446ddf, background color: #f1f5fd, font size: 6.8pt (9px), font weight: normal). Expected contrast ratio of 4.5:1",
    +             "relatedNodes": Array [
    +               Object {
    +                 "html": "<span class=\"inline-flex items-center gap-1 rounded border font-mono tracking-tight bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-border)] px-1 py-0 text-[9px] font-normal\">Yours</span>",
    +                 "target": Array [
    +                   ".bg-\\[var\\(--color-accent-subtle\\)\\]",
    +                 ],
    +               },
    +             ],
    +           },
    +         ],
    +         "failureSummary": "Fix any of the following:
    +   Element has insufficient color contrast of 4.27 (foreground color: #446ddf, background color: #f1f5fd, font size: 6.8pt (9px), font weight: normal). Expected contrast ratio of 4.5:1",
    +         "html": "<span class=\"inline-flex items-center gap-1 rounded border font-mono tracking-tight bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-border)] px-1 py-0 text-[9px] font-normal\">Yours</span>",
    +         "impact": "serious",
    +         "none": Array [],
    +         "target": Array [
    +           ".bg-\\[var\\(--color-accent-subtle\\)\\]",
    +         ],
    +       },
    +     ],
    +     "tags": Array [
    +       "cat.color",
    +       "wcag2aa",
    +       "wcag143",
    +       "TTv5",
    +       "TT13.c",
    +       "EN-301-549",
    +       "EN-9.1.4.3",
    +       "ACT",
    +       "RGAAv4",
    +       "RGAA-3.2.1",
    +     ],
    +   },
    + ]

      40 |       filteredViolations,
      41 |       `Axe violations found in ${contextName}:\n${summary}`
    > 42 |     ).toEqual([]);
         |       ^
      43 |   }
      44 | }
      45 |
        at assertAxeClean (/home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:42:7)
        at /home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:353:7

    Error Context: test-results/a11y-1-2-Automated-Axe-Che-ec1d6-nd-mobile-layout-axe-checks-mobile/error-context.md

5) [mobile] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link

    Error: expect(locator).not.toBeFocused() failed

    Locator:  locator('.cm-content')
    Expected: not focused
    Received: focused
    Timeout:  5000ms

    Call log:
      - Expect "not toBeFocused" locator('.cm-content') with timeout 5000ms
      - waiting for locator('.cm-content')
        14 × locator resolved to <div translate="no" role="textbox" autocorrect="off" spellcheck="false" autocapitalize="off" data-language="html" aria-multiline="true" contenteditable="true" aria-autocomplete="list" writingsuggestions="false" aria-label="HTML code editor" class="cm-content cm-lineWrapping">…</div>
           - unexpected value "focused"


      394 |     await page.keyboard.press("Tab");
      395 |     await page.waitForTimeout(100);
    > 396 |     await expect(editorContent).not.toBeFocused();
          |                                     ^
      397 |   });
      398 |
      399 |   test("Splitter keyboard operation and dragging alternative (SC 2.5.7)", async ({
        at /home/runner/work/accessibility-playground/accessibility-playground/e2e/a11y.spec.ts:396:37

    Error Context: test-results/a11y-1-3-Checks-Axe-Cannot-bf672-ap-prevention-and-skip-link-mobile/error-context.md

5 failed
[desktop] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks
[desktop] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link
[desktop] › e2e/security.spec.ts:86:7 › Security Headers & Isolation (acc.md Part 2) › exercises playground workflows with zero CSP violations
[mobile] › e2e/a11y.spec.ts:333:7 › 1.2 Automated Axe Checks › Playground dialogs, menus, and mobile layout axe checks
[mobile] › e2e/a11y.spec.ts:372:7 › 1.3 Checks Axe Cannot Make › Keyboard only navigation, focus trap prevention, and skip link
317 passed (7.6m)
Error: Process completed with exit code 1.
