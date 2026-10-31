export function encodeSnippet(html: string, css: string): string {
  const payload = JSON.stringify({ h: html, c: css });
  return btoa(
    encodeURIComponent(payload).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  );
}

export function decodeSnippet(
  encoded: string
): { html: string; css: string } | null {
  try {
    const binary = atob(encoded);
    const percentEncoded = binary
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    const payload = JSON.parse(decodeURIComponent(percentEncoded));
    if (typeof payload.h !== "string") return null;
    return {
      html: payload.h,
      css: typeof payload.c === "string" ? payload.c : "",
    };
  } catch {
    return null;
  }
}
