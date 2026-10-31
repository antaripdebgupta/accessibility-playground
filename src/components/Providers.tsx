"use client";

import * as React from "react";
import { ToastProvider } from "@accessly-ui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider placement="bottom-right">{children}</ToastProvider>;
}
