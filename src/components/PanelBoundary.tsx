"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@accessly-ui/react";
import { reportError } from "@/lib/report-error";

interface PanelBoundaryProps {
  name: string;
  children: ReactNode;
}

interface PanelBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PanelBoundary extends Component<
  PanelBoundaryProps,
  PanelBoundaryState
> {
  constructor(props: PanelBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PanelBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    reportError(error, {
      panelName: this.props.name,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="polite"
          className="flex h-full min-h-[140px] flex-col items-center justify-center gap-3 p-4 text-center"
        >
          <div className="flex items-center gap-2 text-[var(--color-danger-default)]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h3 className="text-sm font-semibold">
              Error in {this.props.name}
            </h3>
          </div>
          <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
            This panel encountered an unexpected rendering problem.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={this.handleReload}
            className="h-7 text-xs"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Reload this panel
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
