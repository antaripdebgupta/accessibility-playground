import type { ChallengeContent } from "../types";

const content: ChallengeContent = {
  startHtml:
    '<section class="product-card">\n  <img src="https://picsum.photos/seed/shoes/400/300" class="product-img">\n  <img src="https://picsum.photos/seed/line/400/4" class="divider">\n  <h2>Running Shoes</h2>\n  <p>Lightweight, breathable running shoes for daily training.</p>\n  <button type="button">Add to Cart</button>\n</section>',
  startCss:
    ".product-card {\n  max-width: 360px;\n  border: 1px solid #e2e4e9;\n  border-radius: 10px;\n  padding: 1rem;\n  font-family: system-ui, sans-serif;\n}\n.product-img { width: 100%; border-radius: 8px; }\n.divider { width: 100%; margin: 0.75rem 0; }\nbutton {\n  background: #1d4ed8; color: #fff;\n  padding: 8px 16px; border: none; border-radius: 6px;\n  cursor: pointer; font-size: 0.875rem;\n}\nbutton:hover { background: #1e40af; }",
  expected: [
    {
      ruleId: "img-missing-alt",
      wcag: ["1.1.1"],
    },
  ],
  hints: [
    'Every <img> needs an alt attribute. Describe what the image shows, or use alt="" for decoration.',
    'For the product image, describe what the user would see: alt="Blue running shoes on white background".',
    'The divider is decorative — use alt="" and optionally role="presentation".',
  ],
  solutionHtml:
    '<section class="product-card">\n  <img src="https://picsum.photos/seed/shoes/400/300" class="product-img" alt="Blue running shoes on a white background">\n  <img src="https://picsum.photos/seed/line/400/4" class="divider" alt="" role="presentation">\n  <h2>Running Shoes</h2>\n  <p>Lightweight, breathable running shoes for daily training.</p>\n  <button type="button">Add to Cart</button>\n</section>',
  solutionCss:
    ".product-card {\n  max-width: 360px;\n  border: 1px solid #e2e4e9;\n  border-radius: 10px;\n  padding: 1rem;\n  font-family: system-ui, sans-serif;\n}\n.product-img { width: 100%; border-radius: 8px; }\n.divider { width: 100%; margin: 0.75rem 0; }\nbutton {\n  background: #1d4ed8; color: #fff;\n  padding: 8px 16px; border: none; border-radius: 6px;\n  cursor: pointer; font-size: 0.875rem;\n}\nbutton:hover { background: #1e40af; }",
  verify: {
    ruleIdsMustBeAbsent: ["img-missing-alt", "image-alt"],
  },
  manualSteps: [
    "Turn on a screen reader (NVDA / VoiceOver) and navigate to the image. Does the announcement make sense?",
    "Is the decorative divider skipped by the screen reader?",
  ],
};

export default content;
