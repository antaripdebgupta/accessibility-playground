import { z } from "zod";
import type { ManualTestRecord } from "@/data/manual-tests";

const STORAGE_PREFIX = "ap_manual_tests_v1_";

export const ManualTestStatusSchema = z.enum([
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

export const ManualTestStoragePayloadSchema = z.object({
  version: z.literal(1),
  records: z.record(z.string(), ManualTestRecordSchema),
});

export type ManualTestStoragePayload = z.infer<
  typeof ManualTestStoragePayloadSchema
>;

export function getManualTestStorageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function loadManualTestResults(
  templateOrSnippetId: string
): Record<string, ManualTestRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      getManualTestStorageKey(templateOrSnippetId)
    );
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const validated = ManualTestStoragePayloadSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data.records;
    }
  } catch {
    // Ignore storage parse errors
  }
  return {};
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

  if (typeof window === "undefined") {
    return { success: true };
  }

  try {
    const current = loadManualTestResults(templateOrSnippetId);
    current[record.testId] = validation.data;

    const payload: ManualTestStoragePayload = {
      version: 1,
      records: current,
    };
    window.localStorage.setItem(
      getManualTestStorageKey(templateOrSnippetId),
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to save manual test result",
    };
  }
}

export function clearManualTestResults(templateOrSnippetId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(
      getManualTestStorageKey(templateOrSnippetId)
    );
  } catch {
    // Ignore
  }
}
