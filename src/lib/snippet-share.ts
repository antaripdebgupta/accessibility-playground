import { z } from "zod";

const SnippetPayloadSchema = z.object({
  h: z.string().max(200_000),
  c: z.string().max(200_000).optional().default(""),
});

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
  // Cap length before passing to atob to protect against untrusted input
  if (!encoded || encoded.length > 20_000) return null;
  try {
    const binary = atob(encoded);
    const percentEncoded = binary
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    const parsed: unknown = JSON.parse(decodeURIComponent(percentEncoded));
    const result = SnippetPayloadSchema.safeParse(parsed);
    if (!result.success) return null;
    return {
      html: result.data.h,
      css: result.data.c ?? "",
    };
  } catch {
    return null;
  }
}
