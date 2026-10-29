import { z } from "zod";

export const AxeFindingNodeSchema = z.object({
  html: z.string(),
  target: z.array(z.string()),
  failureSummary: z.string().optional(),
  targetId: z.string().optional(),
});

export const AxeFindingSchema = z.object({
  id: z.string(),
  impact: z.enum(["critical", "serious", "moderate", "minor"]),
  description: z.string(),
  help: z.string(),
  helpUrl: z.string(),
  wcag: z.array(z.string()).optional(),
  source: z.enum(["axe-core", "playground"]).optional(),
  type: z.enum(["violation", "incomplete"]).optional(),
  fix: z.string().optional(),
  nodes: z.array(AxeFindingNodeSchema),
});

export const IframeReadyMessageSchema = z.object({
  type: z.literal("ready"),
});

export const IframeElementClickedMessageSchema = z.object({
  type: z.literal("element-clicked"),
  id: z.string(),
});

export const IframeScanResultsMessageSchema = z.object({
  type: z.literal("scan-results"),
  scanId: z.string().optional(),
  violations: z.array(AxeFindingSchema),
  incomplete: z.array(AxeFindingSchema).optional(),
});

export const IframeScanErrorMessageSchema = z.object({
  type: z.literal("scan-error"),
  scanId: z.string().optional(),
  message: z.string(),
});

export const FocusOrderPositionSchema = z.object({
  id: z.string(),
  tabIndex: z.number(),
  orderIndex: z.number().optional(),
  rect: z.object({
    top: z.number(),
    left: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

export const IframeFocusOrderMessageSchema = z.object({
  type: z.literal("focus-order"),
  elements: z.array(FocusOrderPositionSchema),
});

export const IframeMessageSchema = z.discriminatedUnion("type", [
  IframeReadyMessageSchema,
  IframeElementClickedMessageSchema,
  IframeScanResultsMessageSchema,
  IframeScanErrorMessageSchema,
  IframeFocusOrderMessageSchema,
]);

export type IframeMessage = z.infer<typeof IframeMessageSchema>;

export function safeParseIframeMessage(data: unknown): IframeMessage | null {
  const result = IframeMessageSchema.safeParse(data);
  if (
    !result.success &&
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
  ) {
    console.warn(
      "Iframe message schema validation failed:",
      result.error,
      data
    );
  }
  return result.success ? result.data : null;
}

// Host -> Iframe message schemas
export const HostSelectNodeMessageSchema = z.object({
  type: z.literal("select-node"),
  id: z.string().nullable().optional(),
});

export const HostRunScanMessageSchema = z.object({
  type: z.literal("run-scan"),
  scanId: z.string().optional(),
});

export const HostFocusElementMessageSchema = z.object({
  type: z.literal("focus-element"),
  id: z.string(),
});

export const HostMessageSchema = z.discriminatedUnion("type", [
  HostSelectNodeMessageSchema,
  HostRunScanMessageSchema,
  HostFocusElementMessageSchema,
]);

export type HostMessage = z.infer<typeof HostMessageSchema>;
