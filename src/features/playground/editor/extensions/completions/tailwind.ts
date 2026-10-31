import { syntaxTree } from "@codemirror/language";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

// Common Tailwind utility classes
const TAILWIND_UTILITIES = [
  // Display & Box Model
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "hidden",
  "w-full",
  "w-screen",
  "w-auto",
  "h-full",
  "h-screen",
  "h-auto",
  "min-h-screen",
  "max-w-sm",
  "max-w-md",
  "max-w-lg",
  "max-w-xl",
  "max-w-2xl",
  // Spacing (padding & margin)
  "p-1",
  "p-2",
  "p-3",
  "p-4",
  "p-6",
  "p-8",
  "px-2",
  "px-3",
  "px-4",
  "px-6",
  "py-1",
  "py-2",
  "py-3",
  "py-4",
  "m-1",
  "m-2",
  "m-3",
  "m-4",
  "mx-auto",
  "my-2",
  "my-4",
  "gap-1",
  "gap-2",
  "gap-3",
  "gap-4",
  "gap-6",
  // Flexbox & Grid
  "flex-col",
  "flex-row",
  "flex-wrap",
  "items-center",
  "items-start",
  "items-end",
  "justify-center",
  "justify-between",
  "justify-start",
  "justify-end",
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-4",
  // Typography
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-mono",
  "text-center",
  "text-left",
  "text-right",
  "truncate",
  "underline",
  // Colors & Backgrounds
  "bg-white",
  "bg-black",
  "bg-gray-50",
  "bg-gray-100",
  "bg-gray-200",
  "bg-gray-800",
  "bg-gray-900",
  "bg-blue-500",
  "bg-blue-600",
  "bg-blue-700",
  "bg-red-500",
  "bg-green-500",
  "text-white",
  "text-black",
  "text-gray-600",
  "text-gray-700",
  "text-gray-800",
  "text-gray-900",
  "text-blue-600",
  "text-red-600",
  "text-green-600",
  // Borders & Rounded
  "border",
  "border-2",
  "border-t",
  "border-b",
  "border-gray-200",
  "border-gray-300",
  "rounded",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-full",
  // A11y & Focus
  "sr-only",
  "not-sr-only",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-blue-500",
  "focus:ring-offset-2",
  "focus-visible:outline-2",
  "focus-visible:outline-blue-600",
  "hover:bg-gray-100",
  "hover:bg-blue-700",
  "transition-colors",
  "duration-150",
];

const tailwindOptions = TAILWIND_UTILITIES.map((cls) => ({
  label: cls,
  type: "class",
  detail: "Tailwind utility",
}));

export function tailwindCompletionSource(
  ctx: CompletionContext
): CompletionResult | null {
  const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
  if (
    node.name !== "AttributeValue" &&
    node.name !== "UnquotedAttributeValue"
  ) {
    return null;
  }

  const attr = node.parent;
  const nameNode = attr?.getChild("AttributeName");
  if (!attr || !nameNode) return null;
  const attrName = ctx.state.sliceDoc(nameNode.from, nameNode.to).toLowerCase();

  if (attrName !== "class" && attrName !== "classname") return null;

  const quoted = /^["']/.test(ctx.state.sliceDoc(node.from, node.from + 1));
  const textInside = ctx.state.sliceDoc(node.from + (quoted ? 1 : 0), ctx.pos);
  const lastSpace = textInside.lastIndexOf(" ");
  const from =
    node.from + (quoted ? 1 : 0) + (lastSpace >= 0 ? lastSpace + 1 : 0);

  return {
    from,
    options: tailwindOptions,
    validFor: /^[\w:/-]*$/,
  };
}
