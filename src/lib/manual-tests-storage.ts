import { z } from "zod";
import type { ManualTestRecord } from "@/data/manual-tests";
import { storage } from "./storage";

const STORAGE_PREFIX = "ap_manual_tests_v1_";

const ManualTestStatusSchema = z.enum([
  "not-tested",
  "passed",
  "failed",
  "not-applicable",
]);

export const ManualTestRecordSchema = z
  .object({
    testId: z.string(),
    status: ManualTestStatusSchema,
    note: z.string().optional(),
    updatedAt: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "failed") {
      if (!data.note || data.note.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A note is required when marking a manual test as failed.",
          path: ["note"],
        });
      }
    }
  });

const ManualTestStoragePayloadSchema = z.object({
  version: z.literal(1),
  records: z.record(z.string(), ManualTestRecordSchema),
});

type ManualTestStoragePayload = z.infer<typeof ManualTestStoragePayloadSchema>;

function getManualTestStorageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function loadManualTestResults(
  templateOrSnippetId: string
): Record<string, ManualTestRecord> {
  const payload = storage.getJSON(
    getManualTestStorageKey(templateOrSnippetId),
    ManualTestStoragePayloadSchema
  );
  return payload ? payload.records : {};
}

export function saveManualTestResult(
  templateOrSnippetId: string,
  record: ManualTestRecord
): { success: boolean; error?: string } {
  const validation = ManualTestRecordSchema.safeParse(record);
  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ?? "Invalid manual test record",
    };
  }

  const current = loadManualTestResults(templateOrSnippetId);
  current[record.testId] = validation.data;

  const payload: ManualTestStoragePayload = {
    version: 1,
    records: current,
  };
  const saved = storage.setJSON(
    getManualTestStorageKey(templateOrSnippetId),
    payload
  );
  if (!saved) {
    return {
      success: false,
      error: "Failed to save manual test result",
    };
  }
  return { success: true };
}

export function clearManualTestResults(templateOrSnippetId: string): void {
  storage.remove(getManualTestStorageKey(templateOrSnippetId));
}
