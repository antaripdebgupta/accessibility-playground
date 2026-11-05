import type { Finding } from "@/types/a11y";

export function generateContextualFix(
  finding: Finding,
  defaultGoodExample: string
): string {
  const primaryNode = finding.nodes[0];
  const html = primaryNode?.html || "";

  if (finding.ruleId === "img-missing-alt" || finding.ruleId === "image-alt") {
    if (html.startsWith("<img")) {
      if (/alt\s*=\s*["'][^"']*["']/i.test(html)) {
        return html;
      }
      return html.replace(
        /<img\b([^>]*)>/i,
        `<img$1 alt="Meaningful description of the image">`
      );
    }
  }

  if (
    finding.ruleId === "button-name" ||
    (finding.ruleId === "empty-interactive-name" && html.startsWith("<button"))
  ) {
    if (html.startsWith("<button")) {
      return html.replace(
        /<button\b([^>]*)>/i,
        `<button$1 aria-label="Action description">`
      );
    }
  }

  if (
    finding.ruleId === "link-name" ||
    (finding.ruleId === "empty-interactive-name" && html.startsWith("<a"))
  ) {
    if (html.startsWith("<a")) {
      return html.replace(
        /<a\b([^>]*)>/i,
        `<a$1 aria-label="Destination description">`
      );
    }
  }

  if (
    finding.ruleId === "label" ||
    finding.ruleId === "input-no-label" ||
    finding.ruleId === "input-placeholder-only"
  ) {
    const idMatch = html.match(/id\s*=\s*["']([^"']+)["']/i);
    const placeholderMatch = html.match(/placeholder\s*=\s*["']([^"']+)["']/i);
    const labelText = placeholderMatch ? placeholderMatch[1] : "Field Label";
    if (idMatch && idMatch[1]) {
      return `<label for="${idMatch[1]}">${labelText}</label>\n${html}`;
    } else {
      const suggestedId = "field-input";
      const withId = html.replace(
        /<input\b([^>]*)>/i,
        `<input$1 id="${suggestedId}">`
      );
      return `<label for="${suggestedId}">${labelText}</label>\n${withId}`;
    }
  }

  return defaultGoodExample;
}
