"use client";

import React from "react";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorFieldProps {
  id: string;
  label: string;
  hex: string;
  normalizedHex: string | null;
  isValid: boolean;
  onHexChange: (val: string) => void;
  supportsEyeDropper: boolean;
  onEyeDropper: () => void;
  pickerAriaLabel: string;
  eyeDropperTitle: string;
  defaultPickerColor?: string;
}

export function ColorField({
  id,
  label,
  hex,
  normalizedHex,
  isValid,
  onHexChange,
  supportsEyeDropper,
  onEyeDropper,
  pickerAriaLabel,
  eyeDropperTitle,
  defaultPickerColor = "#000000",
}: ColorFieldProps) {
  const hexInputId = `${id}-hex`;
  const pickerId = `${id}-picker`;
  const errorId = `${id}-error`;
  const swatchId = `${id}Swatch`;

  return (
    <div className="field">
      <label htmlFor={hexInputId}>{label}</label>
      <div className="field-row">
        <div
          className="swatch"
          id={swatchId}
          aria-hidden="true"
          style={{
            backgroundColor:
              isValid && normalizedHex ? normalizedHex : "transparent",
          }}
        />
        <input
          id={hexInputId}
          className={cn("hex-input", !isValid && "is-invalid")}
          type="text"
          value={hex}
          onChange={(e) => onHexChange(e.target.value)}
          aria-invalid={!isValid}
          aria-describedby={!isValid ? errorId : undefined}
          spellCheck={false}
          autoComplete="off"
        />
        <input
          id={pickerId}
          className="color-picker"
          type="color"
          value={normalizedHex ?? defaultPickerColor}
          onChange={(e) => onHexChange(e.target.value)}
          aria-label={pickerAriaLabel}
        />
        {supportsEyeDropper && (
          <button
            type="button"
            onClick={onEyeDropper}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
            title={eyeDropperTitle}
            aria-label={eyeDropperTitle}
          >
            <Pipette className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {!isValid && (
        <span className="field-error" id={errorId} role="alert">
          Enter a valid 3- or 6-digit hex color.
        </span>
      )}
    </div>
  );
}
