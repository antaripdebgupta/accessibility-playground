/**
 * Minimal HTML to JSX transform for hand-authored pattern snippets.
 * Scope:
 * - class="..." -> className="..."
 * - for="..." -> htmlFor="..."
 * - inline style="prop: val; prop2: val2" -> style={{ prop: 'val', prop2: 'val2' }}
 * - self-close known void elements (img, input, br, hr) if not already self-closed
 * - preserve everything else (data-*, aria-*, etc.) untouched
 */
export function htmlToJsx(html: string): string {
  let result = html;

  // 1. class="..." -> className="..."
  result = result.replace(/\bclass=(["'])(.*?)\1/g, "className=$1$2$1");

  // 2. for="..." -> htmlFor="..."
  result = result.replace(/\bfor=(["'])(.*?)\1/g, "htmlFor=$1$2$1");

  // 3. inline style="..." -> style={{ ... }}
  result = result.replace(/\bstyle=(["'])(.*?)\1/g, (_, __, styleContent) => {
    const declarations = styleContent
      .split(";")
      .map((d: string) => d.trim())
      .filter(Boolean);

    if (declarations.length === 0) return "style={{}}";

    const entries = declarations
      .map((decl: string) => {
        const colonIdx = decl.indexOf(":");
        if (colonIdx === -1) return null;
        const prop = decl.slice(0, colonIdx).trim();
        const val = decl.slice(colonIdx + 1).trim();
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return `${camelProp}: '${val.replace(/'/g, "\\'")}'`;
      })
      .filter(Boolean);

    return `style={{ ${entries.join(", ")} }}`;
  });

  // 4. Self-close known void elements: img, input, br, hr
  result = result.replace(
    /<(img|input|br|hr)\b((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/gi,
    (match, tag, attrs, slash) => {
      if (slash === "/") return match;
      const trimmedAttrs = attrs.trimEnd();
      return `<${tag}${trimmedAttrs ? " " + trimmedAttrs.trim() : ""} />`;
    }
  );

  return result;
}
