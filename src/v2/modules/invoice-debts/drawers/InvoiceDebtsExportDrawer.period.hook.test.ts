import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInvoiceDebtsExportPeriod } from "./InvoiceDebtsExportDrawer.period.hook";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, optsOrFallback?: any) =>
      typeof optsOrFallback === "object"
        ? optsOrFallback.defaultValue || _key
        : optsOrFallback || _key,
  }),
}));

describe("useInvoiceDebtsExportPeriod", () => {
  it("initializes with by-period mode and month periodType", () => {
    const { result } = renderHook(() => useInvoiceDebtsExportPeriod());

    expect(result.current.exportMode).toBe("by-period");
    expect(result.current.periodType).toBe("month");
    expect(result.current.dateFrom).toBeDefined();
    expect(result.current.dateTo).toBeDefined();
    expect(result.current.periodOptions.length).toBeGreaterThan(0);
  });

  it("changes periodType to quarter and updates dates", () => {
    const { result } = renderHook(() => useInvoiceDebtsExportPeriod());

    act(() => {
      result.current.handlePeriodTypeChange("quarter");
    });

    expect(result.current.periodType).toBe("quarter");
    expect(result.current.quarter).toBeDefined();
  });

  it("updates exportMode", () => {
    const { result } = renderHook(() => useInvoiceDebtsExportPeriod());

    act(() => {
      result.current.setExportMode("by-current-filter");
    });

    expect(result.current.exportMode).toBe("by-current-filter");
  });
});
