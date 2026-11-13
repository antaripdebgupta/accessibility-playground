import { NextResponse } from "next/server";
import type { ScrubbedErrorReport } from "@/lib/report-error";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ScrubbedErrorReport>;

    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.message !== "string" ||
      typeof body.route !== "string" ||
      !body.route.startsWith("/") ||
      body.route.includes("?") ||
      body.route.includes("#")
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const sanitizedReport: ScrubbedErrorReport = {
      name: body.name.slice(0, 100),
      message: body.message.slice(0, 500),
      ...(typeof body.stack === "string"
        ? { stack: body.stack.slice(0, 2000) }
        : {}),
      route: body.route.slice(0, 120),
      version:
        typeof body.version === "string" ? body.version.slice(0, 20) : "0.1.0",
      timestamp:
        typeof body.timestamp === "string"
          ? body.timestamp.slice(0, 40)
          : new Date().toISOString(),
      ...(body.context && typeof body.context === "object"
        ? {
            context: Object.fromEntries(
              Object.entries(body.context)
                .slice(0, 10)
                .map(([k, v]) => [
                  String(k).slice(0, 30),
                  String(v).slice(0, 100),
                ])
            ),
          }
        : {}),
    };

    console.error("[ClientErrorReport]", JSON.stringify(sanitizedReport));

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to process report" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
