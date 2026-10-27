"use client";

import * as React from "react";
import { Button, useToast } from "@accessly-ui/react";
import { Copy, Check } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.push({
          title: "Code copied to clipboard",
          description:
            "Accessible pattern snippet is ready to paste into your codebase.",
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        toast.push({
          title: "Code copied to clipboard",
          description: "Copied via fallback mechanism.",
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.push({
        title: "Copy failed",
        description:
          "Clipboard access was denied. Please select and copy manually.",
        variant: "danger",
      });
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleCopy}
      className="text-md h-8 gap-1.5 px-2.5"
      aria-label={
        copied ? "Copied! Code copied to clipboard" : "Copy code to clipboard"
      }
    >
      {copied ? (
        <>
          <Check
            className="h-3.5 w-3.5 text-[var(--color-success-default)]"
            aria-hidden="true"
          />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Copy code</span>
        </>
      )}
    </Button>
  );
}
