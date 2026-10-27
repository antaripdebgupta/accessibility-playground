"use client";

import * as React from "react";
import { ToastProvider } from "@accessly-ui/react";
import { Header } from "@/components/Header";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider placement="bottom-right">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </ToastProvider>
  );
}
