export const DEFAULT_DOCUMENT = {
  html: `<article class="card">
  <header>
    <span class="badge" aria-label="Status: Published">Published</span>
    <h2>WCAG 2.2 Overview</h2>
  </header>
  <p>
    Accessible web development ensures that digital tools are operable,
    understandable, and robust for every person.
  </p>
  <footer>
    <button type="button" class="btn-primary">
      Read Guideline
    </button>
  </footer>
</article>`,
  css: `.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  background: #ffffff;
  max-width: 400px;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  background: #eef3fd;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}
.btn-primary {
  background: #1d4ed8;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}`,
} as const;
