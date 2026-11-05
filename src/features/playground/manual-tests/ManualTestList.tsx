"use client";

import * as React from "react";
import type {
  ManualTestItem as ManualTestItemType,
  ManualTestRecord,
  ManualTestStatus,
} from "@/data/manual-tests";
import { ManualTestItem } from "./ManualTestItem";

export interface ManualTestListProps {
  tests: readonly ManualTestItemType[];
  records: Record<string, ManualTestRecord>;
  validationErrors: Record<string, string>;
  onUpdateStatus: (id: string, status: ManualTestStatus, note?: string) => void;
}

export function ManualTestList({
  tests,
  records,
  validationErrors,
  onUpdateStatus,
}: ManualTestListProps) {
  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <ManualTestItem
          key={`${test.id}-${records[test.id]?.updatedAt ?? "init"}`}
          test={test}
          record={records[test.id]}
          validationError={validationErrors[test.id]}
          onStatusChange={(status, note) =>
            onUpdateStatus(test.id, status, note)
          }
        />
      ))}
    </div>
  );
}
