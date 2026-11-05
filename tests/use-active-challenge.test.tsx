import { describe, it, expect, vi, beforeEach } from "vitest";
import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useActiveChallenge } from "@/features/playground/hooks/useActiveChallenge";
import * as reportErrorModule from "@/lib/report-error";
import { STARTER_TEMPLATES } from "@/data/templates";
import type { Challenge } from "@/data/challenges";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockToastPush = vi.fn();
const toastObj = { push: mockToastPush };
vi.mock("@accessly-ui/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useToast: () => toastObj,
  };
});

const mockLoadChallenge = vi.fn();
vi.mock("@/data/challenges", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    loadChallenge: (id: string) => mockLoadChallenge(id),
  };
});

describe("Item 3: useActiveChallenge error handling and race guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountChallengeHook(initialParam: string | null) {
    let currentParam = initialParam;
    const setRawHtml = vi.fn();
    const setRawCss = vi.fn();
    const pushExternalEdit = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let latestResult: ReturnType<typeof useActiveChallenge> = null!;

    function TestComponent({ param }: { param: string | null }) {
      latestResult = useActiveChallenge(
        param,
        setRawHtml,
        setRawCss,
        pushExternalEdit
      );
      return null;
    }

    act(() => {
      root.render(<TestComponent param={currentParam} />);
    });

    return {
      get result() {
        return latestResult;
      },
      setParam: (newParam: string | null) => {
        currentParam = newParam;
        act(() => {
          root.render(<TestComponent param={currentParam} />);
        });
      },
      setRawHtml,
      setRawCss,
      pushExternalEdit,
      unmount: () => {
        act(() => {
          root.unmount();
        });
        document.body.removeChild(container);
      },
    };
  }

  it("handles loader rejection: shows toast, status 'error', loads default template, calls reportError once", async () => {
    const reportErrorSpy = vi.spyOn(reportErrorModule, "reportError");
    mockLoadChallenge.mockRejectedValueOnce(new Error("Network import failed"));

    const harness = mountChallengeHook("failing-challenge");

    // Wait for the rejection promise to settle
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(harness.result.status).toBe("error");
    expect(harness.result.activeChallenge).toBeNull();
    expect(mockToastPush).toHaveBeenCalledTimes(1);
    expect(mockToastPush).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          "Couldn't load this challenge. Showing the default example.",
      })
    );
    expect(reportErrorSpy).toHaveBeenCalledTimes(1);
    expect(reportErrorSpy).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ challengeId: "failing-challenge" })
    );
    expect(harness.setRawHtml).toHaveBeenCalledWith(
      STARTER_TEMPLATES[0]?.html ?? ""
    );

    harness.unmount();
  });

  it("handles unknown challenge id: shows toast, status 'error', loads default template, calls reportError once", async () => {
    const reportErrorSpy = vi.spyOn(reportErrorModule, "reportError");
    mockLoadChallenge.mockResolvedValueOnce({
      ok: false,
      reason: "unknown-id",
    });

    const harness = mountChallengeHook("unknown-challenge-id-12345");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(harness.result.status).toBe("error");
    expect(harness.result.activeChallenge).toBeNull();
    expect(mockToastPush).toHaveBeenCalledTimes(1);
    expect(mockToastPush).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          "Couldn't load this challenge. Showing the default example.",
      })
    );
    expect(reportErrorSpy).toHaveBeenCalledTimes(1);
    expect(harness.setRawHtml).toHaveBeenCalledWith(
      STARTER_TEMPLATES[0]?.html ?? ""
    );

    harness.unmount();
  });

  it("race guard: switching challenge ids quickly never applies the older challenge", async () => {
    let resolveFirst!: (val: unknown) => void;
    const firstPromise = new Promise((res) => {
      resolveFirst = res;
    });

    const mockFastChallenge: Challenge = {
      id: "fast-2",
      title: "Fast Challenge 2",
      difficulty: "beginner",
      summary: "summary",
      objectives: ["obj"],
      hintsCount: 1,
      startHtml: "<h1>Fast 2</h1>",
      solutionHtml: "<h1>Fast 2 Solved</h1>",
      expected: [],
      hints: ["hint 1"],
      verify: { ruleIdsMustBeAbsent: [] },
      manualSteps: [],
    };

    const mockSlowChallenge: Challenge = {
      id: "slow-1",
      title: "Slow Challenge 1",
      difficulty: "beginner",
      summary: "summary",
      objectives: ["obj"],
      hintsCount: 1,
      startHtml: "<h1>Slow 1</h1>",
      solutionHtml: "<h1>Slow 1 Solved</h1>",
      expected: [],
      hints: ["hint 1"],
      verify: { ruleIdsMustBeAbsent: [] },
      manualSteps: [],
    };

    mockLoadChallenge.mockImplementation((id: string) => {
      if (id === "slow-1") {
        return firstPromise;
      }
      return Promise.resolve({
        ok: true,
        challenge: mockFastChallenge,
      });
    });

    const harness = mountChallengeHook("slow-1");
    expect(harness.result.status).toBe("loading");

    // Switch to fast-2 before slow-1 resolves
    harness.setParam("fast-2");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(harness.result.status).toBe("ready");
    expect(harness.result.activeChallenge?.id).toBe("fast-2");

    // Now slow-1 resolves late
    await act(async () => {
      resolveFirst({
        ok: true,
        challenge: mockSlowChallenge,
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    // Stale slow-1 must NOT overwrite fast-2
    expect(harness.result.activeChallenge?.id).toBe("fast-2");

    harness.unmount();
  });
});
