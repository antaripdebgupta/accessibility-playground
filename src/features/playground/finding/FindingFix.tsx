"use client";

import * as React from "react";
import type { AxeFinding, AxeFindingNode } from "@/types/a11y";
import {
  isAutoFixable,
  computeFixPreview,
  type ImgAltFixMode,
  type ApplyAutoFixOptions,
} from "@/lib/auto-fix";
import { CodeSnippet } from "@/components/ui/CodeSnippet";
import { Wrench } from "lucide-react";

export interface FindingFixProps {
  axeFinding: AxeFinding;
  ruleId: string;
  primaryNode?: AxeFindingNode;
  onApplyFix?: (finding: AxeFinding, options?: ApplyAutoFixOptions) => void;
}

export function FindingFix({
  axeFinding,
  ruleId,
  primaryNode,
  onApplyFix,
}: FindingFixProps) {
  const [showAutoFixPreview, setShowAutoFixPreview] = React.useState(false);
  const [imgAltMode, setImgAltMode] = React.useState<ImgAltFixMode>("informative");

  const hasAutoFix = isAutoFixable(ruleId);
  if (!hasAutoFix) return null;

  const hasNearbyCaption = Boolean(
    primaryNode?.html &&
      (/\baria-labelledby\b/i.test(primaryNode.html) ||
        /\baria-describedby\b/i.test(primaryNode.html) ||
        /<figcaption\b/i.test(primaryNode.html))
  );

  const fixPreview = computeFixPreview(axeFinding, {
    mode: ruleId === "img-missing-alt" ? imgAltMode : undefined,
    hasVisibleCaption: hasNearbyCaption,
  });

  if (!fixPreview) return null;

  return (
    <section className="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-primary)]">
          <Wrench
            className="h-3.5 w-3.5 text-[var(--color-accent)]"
            aria-hidden="true"
          />
          <h4>Automated Fix Available</h4>
        </div>
        <button
          type="button"
          onClick={() => setShowAutoFixPreview(!showAutoFixPreview)}
          className="text-[11px] font-medium text-[var(--color-focus-ring)] hover:underline"
        >
          {showAutoFixPreview ? "Hide diff" : "Preview diff"}
        </button>
      </div>

      {ruleId === "img-missing-alt" && (
        <fieldset className="flex flex-col gap-1.5 pt-1 text-xs">
          <legend className="font-medium text-[var(--color-text-secondary)]">
            Image accessibility option:
          </legend>
          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="imgAltMode"
                value="informative"
                checked={imgAltMode === "informative"}
                onChange={() => setImgAltMode("informative")}
                className="text-[var(--color-accent)] focus:ring-[var(--color-focus-ring)]"
              />
              <span>Informative image</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="imgAltMode"
                value="decorative"
                checked={imgAltMode === "decorative"}
                onChange={() => setImgAltMode("decorative")}
                className="text-[var(--color-accent)] focus:ring-[var(--color-focus-ring)]"
              />
              <span>Decorative image (alt=&quot;&quot;)</span>
            </label>
            {hasNearbyCaption && (
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="imgAltMode"
                  value="use-caption"
                  checked={imgAltMode === "use-caption"}
                  onChange={() => setImgAltMode("use-caption")}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-focus-ring)]"
                />
                <span>Use caption</span>
              </label>
            )}
          </div>
          {fixPreview.note && (
            <p className="text-[11px] text-[var(--color-text-secondary)] italic">
              {fixPreview.note}
            </p>
          )}
        </fieldset>
      )}

      {showAutoFixPreview && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[var(--color-danger-default)] uppercase">
                Current
              </span>
              <CodeSnippet code={fixPreview.beforeTag} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[var(--color-success-default)] uppercase">
                Proposed
              </span>
              <CodeSnippet code={fixPreview.afterTag} />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() =>
                onApplyFix?.(axeFinding, {
                  mode: ruleId === "img-missing-alt" ? imgAltMode : undefined,
                })
              }
              className="inline-flex items-center gap-1.5 rounded bg-[var(--color-accent)] px-3 py-1 font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              <Wrench className="h-3 w-3" aria-hidden="true" />
              <span>Apply Auto-Fix</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
