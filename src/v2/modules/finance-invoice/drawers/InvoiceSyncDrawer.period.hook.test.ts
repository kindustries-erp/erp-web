import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInvoiceSyncPeriod } from "./InvoiceSyncDrawer.period.hook";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, optsOrFallback?: any) =>
      typeof optsOrFallback === "object"
        ? optsOrFallback.defaultValue || _key
        : optsOrFallback || _key,
  }),
}));

describe("useInvoiceSyncPeriod", () => {
  it("mặc định là tháng hiện tại với khoảng ngày đầy đủ", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    expect(result.current.periodType).toBe("month");
    expect(result.current.dateFrom).toMatch(/^\d{4}-\d{2}-01$/);
    expect(result.current.dateTo >= result.current.dateFrom).toBe(true);
  });

  it("cho phép khoảng tùy chỉnh dài hơn 30 ngày", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.handlePeriodTypeChange("custom");
      result.current.setDateFrom("2026-01-01");
      result.current.setDateTo("2026-06-30");
    });

    expect(result.current.dateFrom).toBe("2026-01-01");
    expect(result.current.dateTo).toBe("2026-06-30");
  });

  it("reset về tháng hiện tại", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.setDateFrom("2026-01-01");
      result.current.setDateTo("2026-06-30");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.periodType).toBe("month");
    expect(result.current.dateFrom).toMatch(/^\d{4}-\d{2}-01$/);
  });
});
