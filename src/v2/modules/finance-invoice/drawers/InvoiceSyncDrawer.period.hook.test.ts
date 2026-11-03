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

    expect(result.current.unit).toBe("month");
    expect(result.current.dateFrom).toMatch(/^\d{4}-\d{2}-01$/);
    expect(result.current.dateTo >= result.current.dateFrom).toBe(true);
  });

  it("chọn tuần đặt khoảng ngày từ thứ Hai đến Chủ nhật", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.handleUnitChange("week");
    });
    act(() => {
      result.current.handlePeriodChange("2026-W42");
    });

    expect(result.current.unit).toBe("week");
    expect(result.current.dateFrom).toBe("2026-10-12");
    expect(result.current.dateTo).toBe("2026-10-18");
  });

  it("chọn quý cập nhật khoảng ngày theo quý", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.handleUnitChange("quarter");
    });
    act(() => {
      result.current.handlePeriodChange("2026-Q2");
    });

    expect(result.current.dateFrom).toBe("2026-04-01");
    expect(result.current.dateTo).toBe("2026-06-30");
  });

  it("tùy chỉnh cho phép khoảng dài hơn 30 ngày và giữ nguyên khi đổi sang tùy chỉnh", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.handleUnitChange("custom");
    });
    act(() => {
      result.current.setDateFrom("2026-01-01");
      result.current.setDateTo("2026-06-30");
    });

    expect(result.current.unit).toBe("custom");
    expect(result.current.period).toBe("");
    expect(result.current.dateFrom).toBe("2026-01-01");
    expect(result.current.dateTo).toBe("2026-06-30");
  });

  it("reset về tháng hiện tại", () => {
    const { result } = renderHook(() => useInvoiceSyncPeriod());

    act(() => {
      result.current.handleUnitChange("custom");
      result.current.setDateFrom("2026-01-01");
      result.current.setDateTo("2026-06-30");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.unit).toBe("month");
    expect(result.current.dateFrom).toMatch(/^\d{4}-\d{2}-01$/);
  });
});
