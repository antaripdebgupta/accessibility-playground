import { snippetCompletion } from "@codemirror/autocomplete";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { HTML_A11Y_SNIPPETS } from "@/data/editor-snippets";

const completions = HTML_A11Y_SNIPPETS.map((snip) =>
  snippetCompletion(snip.template, {
    label: snip.label,
    detail: snip.detail,
    type: "snippet",
    boost: 2,
  })
);

export function a11ySnippetsCompletionSource(
  ctx: CompletionContext
): CompletionResult | null {
  const word = ctx.matchBefore(/a11y:?[\w-]*/);
  if (!word && !ctx.explicit) return null;

  return {
    from: word ? word.from : ctx.pos,
    options: completions,
    validFor: /^a11y:?[\w-]*$/,
  };
}
