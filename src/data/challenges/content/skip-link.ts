import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<header class="site-nav">\n  <nav aria-label="Main navigation">\n    <a href="#home">Home</a>\n    <a href="#products">Products</a>\n    <a href="#solutions">Solutions</a>\n    <a href="#docs">Documentation</a>\n    <a href="#pricing">Pricing</a>\n    <a href="#blog">Blog</a>\n    <a href="#support">Support</a>\n    <a href="#contact">Contact</a>\n  </nav>\n</header>\n\n<div class="content">\n  <h1>Welcome to Our Platform</h1>\n  <p>We provide tools to help development teams build accessible web applications. Our platform includes automated scanning, real-world challenges, and comprehensive learning resources.</p>\n  <p>Get started by exploring our documentation or trying the interactive playground.</p>\n</div>',
  startCss:
    ".site-nav {\n  padding: 12px 20px; border-bottom: 1px solid #e2e4e9;\n  font-family: system-ui, sans-serif;\n}\n.site-nav nav { display: flex; gap: 16px; flex-wrap: wrap; }\n.site-nav a {\n  color: #4b5563; text-decoration: none; font-size: 0.9375rem;\n  padding: 4px 0;\n}\n.site-nav a:hover { color: #1d4ed8; }\n.site-nav a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; border-radius: 3px; }\n.content {\n  max-width: 640px; padding: 2rem 20px; line-height: 1.6;\n  font-family: system-ui, sans-serif;\n}\n.content h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }\n.content p { color: #4b5563; }",
  expected: [
    {
      ruleId: "bypass-blocks",
      wcag: ["2.4.1"],
    },
  ],
  hints: [
    "Keyboard users must tab through all 8 navigation links to reach the content. A skip link lets them bypass the navigation.",
    'Add an <a href="#main-content"> as the very first element inside <body>. Use CSS to hide it until focused.',
    'Change the content <div> to <main id="main-content"> so the skip link has a target and screen readers recognise the landmark.',
  ],
  solutionHtml:
    '<a href="#main-content" class="skip-link">Skip to main content</a>\n\n<header class="site-nav">\n  <nav aria-label="Main navigation">\n    <a href="#home">Home</a>\n    <a href="#products">Products</a>\n    <a href="#solutions">Solutions</a>\n    <a href="#docs">Documentation</a>\n    <a href="#pricing">Pricing</a>\n    <a href="#blog">Blog</a>\n    <a href="#support">Support</a>\n    <a href="#contact">Contact</a>\n  </nav>\n</header>\n\n<main id="main-content" class="content">\n  <h1>Welcome to Our Platform</h1>\n  <p>We provide tools to help development teams build accessible web applications. Our platform includes automated scanning, real-world challenges, and comprehensive learning resources.</p>\n  <p>Get started by exploring our documentation or trying the interactive playground.</p>\n</main>',
  solutionCss:
    ".skip-link {\n  position: absolute; top: -100%; left: 16px;\n  padding: 8px 16px; background: #1d4ed8; color: #fff;\n  border-radius: 0 0 6px 6px; font-size: 0.875rem; font-weight: 600;\n  text-decoration: none; z-index: 100;\n  transition: top 0.15s ease;\n}\n.skip-link:focus { top: 0; }\n.site-nav {\n  padding: 12px 20px; border-bottom: 1px solid #e2e4e9;\n  font-family: system-ui, sans-serif;\n}\n.site-nav nav { display: flex; gap: 16px; flex-wrap: wrap; }\n.site-nav a {\n  color: #4b5563; text-decoration: none; font-size: 0.9375rem;\n  padding: 4px 0;\n}\n.site-nav a:hover { color: #1d4ed8; }\n.site-nav a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; border-radius: 3px; }\n.content {\n  max-width: 640px; padding: 2rem 20px; line-height: 1.6;\n  font-family: system-ui, sans-serif;\n}\n.content h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }\n.content p { color: #4b5563; }",
  verify: {
    ruleIdsMustBeAbsent: [],
  },
  manualSteps: [
    "Press Tab once — does the skip link appear visually?",
    "Press Enter on the skip link — does focus move to the main content area?",
    "Does the screen reader announce the main landmark?",
  ],
};

export default content;
