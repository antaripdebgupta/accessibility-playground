"use client";

import * as React from "react";
import type { AxeFinding } from "@/types/a11y";

export function useScanState() {
  const [axeViolations, setAxeViolations] = React.useState<
    readonly AxeFinding[]
  >([]);
  const [axeIncomplete, setAxeIncomplete] = React.useState<
    readonly AxeFinding[]
  >([]);
  const [scanId, setScanId] = React.useState<string>("initial");
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState<string | null>(null);

  const triggerScan = React.useCallback(() => {
    setIsScanning(true);
    setScanId(`scan-${Date.now()}`);
  }, []);

  const handleScanResults = React.useCallback(
    (results: readonly AxeFinding[], inc?: readonly AxeFinding[]) => {
      setAxeViolations(results);
      setAxeIncomplete(inc || []);
      setIsScanning(false);
      setScanError(null);
    },
    []
  );

  const handleScanError = React.useCallback((error: string) => {
    setScanError(error);
    setIsScanning(false);
  }, []);

  return {
    scanId,
    isScanning,
    setIsScanning,
    scanError,
    axeViolations,
    axeIncomplete,
    triggerScan,
    handleScanResults,
    handleScanError,
  };
}
