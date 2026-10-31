import { snippetCompletion } from "@codemirror/autocomplete";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { CSS_A11Y_SNIPPETS } from "@/data/editor-snippets";

const snippetOptions = CSS_A11Y_SNIPPETS.map((snip) =>
  snippetCompletion(snip.template, {
    label: snip.label,
    detail: snip.detail,
    type: "snippet",
    boost: 2,
  })
);

export function extractCssCustomProperties(cssText: string): string[] {
  const props: string[] = [];
  const regex = /(--[\w-]+)\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cssText)) !== null) {
    if (match[1] && !props.includes(match[1])) {
      props.push(match[1]);
    }
  }
  return props;
}

export function cssA11yCompletionSource(
  ctx: CompletionContext
): CompletionResult | null {
  // 1. Check custom properties: var(--...
  const varMatch = ctx.matchBefore(/var\(\s*--[\w-]*/);
  if (varMatch) {
    const props = extractCssCustomProperties(ctx.state.doc.toString());
    const dashPos = varMatch.text.lastIndexOf("--");
    return {
      from: varMatch.from + dashPos,
      options: props.map((p) => ({
        label: p,
        type: "variable",
        detail: "Custom property",
      })),
      validFor: /^--[\w-]*$/,
    };
  }

  // 2. A11y CSS snippets: a11y:...
  const word = ctx.matchBefore(/a11y:?[\w-]*/);
  if (word || ctx.explicit) {
    return {
      from: word ? word.from : ctx.pos,
      options: snippetOptions,
      validFor: /^a11y:?[\w-]*$/,
    };
  }

  return null;
}
