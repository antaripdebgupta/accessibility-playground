import type { Diagnostic } from "@codemirror/lint";
import { setDiagnostics } from "@codemirror/lint";
import type { EditorView } from "@codemirror/view";
import type { A11yNode, AxeFinding, Finding } from "@/types/a11y";

export type AnyFinding = AxeFinding | Finding;

export interface BuildDiagnosticsOptions {
  ast: A11yNode | null;
  findings: readonly AnyFinding[];
  parseError?: string | null;
  onApplyFix?: (finding: AnyFinding) => void;
  onSelectFinding?: (findingId: string) => void;
}

export function findNodeByTarget(
  root: A11yNode | null,
  targetId: string
): A11yNode | null {
  if (!root) return null;
  const cleanId = targetId.replace(/^#/, "");
  if (root.id === targetId || root.attributes?.id === cleanId) return root;
  for (const child of root.children) {
    const found = findNodeByTarget(child, targetId);
    if (found) return found;
  }
  return null;
}

/**
 * Builds CodeMirror diagnostics from accessibility findings and parse errors.
 * Never throws, caps bounds to doc length, maps severity, and includes quick fix actions.
 */
export function buildDiagnostics(
  docLength: number,
  options: BuildDiagnosticsOptions
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (options.parseError) {
    diagnostics.push({
      from: 0,
      to: Math.min(1, docLength),
      severity: "warning",
      message: `HTML parse warning: ${options.parseError}`,
      source: "parser",
    });
  }

  if (!options.ast || !options.findings.length) {
    return diagnostics;
  }

  for (const finding of options.findings) {
    const ruleId = "id" in finding ? finding.id : finding.ruleId;
    const impact = finding.impact;
    const severity: Diagnostic["severity"] =
      impact === "critical" || impact === "serious"
        ? "error"
        : impact === "moderate"
          ? "warning"
          : "info";

    const help = finding.help || finding.description;
    const fixText = finding.fix;

    for (const nodeRef of finding.nodes) {
      const targetId = nodeRef.targetId || nodeRef.target?.[0];
      if (!targetId) continue;

      const matchedNode = findNodeByTarget(options.ast, targetId);
      if (!matchedNode || !matchedNode.sourceRange) continue;

      const [start, end] = matchedNode.sourceRange;
      const validFrom = Math.max(0, Math.min(start, docLength));
      const validTo = Math.max(validFrom, Math.min(end, docLength));

      const actions: { name: string; apply: () => void }[] = [];
      if (fixText && options.onApplyFix) {
        actions.push({
          name: `Fix: ${fixText}`,
          apply: () => options.onApplyFix?.(finding),
        });
      }
      if (options.onSelectFinding) {
        actions.push({
          name: "View in Issues tab",
          apply: () => options.onSelectFinding?.(ruleId),
        });
      }

      diagnostics.push({
        from: validFrom,
        to: validTo,
        severity,
        message: `${help} [${ruleId}]`,
        source: "a11y",
        actions: actions.length > 0 ? actions : undefined,
      });
    }
  }

  diagnostics.sort((a, b) => a.from - b.from);
  return diagnostics;
}

/**
 * Dispatches diagnostics to the CodeMirror EditorView.
 */
export function updateEditorDiagnostics(
  view: EditorView,
  diagnostics: Diagnostic[]
): void {
  view.dispatch(setDiagnostics(view.state, diagnostics));
}
