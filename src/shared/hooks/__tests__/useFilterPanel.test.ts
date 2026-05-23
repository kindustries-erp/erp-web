import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act as actHook } from "@testing-library/react";
import { useFilterPanel } from "../useFilterPanel";

vi.mock("@/modules/finance/utils/financeHelpers", () => ({
  PERIOD_OPTS: [{ value: "2026-05", label: "Tháng 5/2026" }],
  initPeriod: () => "2026-05",
  initDateFrom: () => "2026-05-01",
  initDateTo: () => "2026-05-31",
  periodFirstDay: (p: string) => `${p}-01`,
  periodLastDay: (p: string) => {
    if (!p) return "";
    const [y, m] = p.split("-").map(Number);
    return `${p}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  },
  monthFirstDay: (date: string) => (date ? `${date.slice(0, 7)}-01` : ""),
}));

describe("useFilterPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial state with period defaults when config.period = true", () => {
    const { result } = renderHook(() => useFilterPanel({ period: true }));

    expect(result.current.state.period).toBe("2026-05");
    expect(result.current.state.dateFrom).toBe("2026-05-01");
    expect(result.current.state.dateTo).toBe("2026-05-31");
    expect(result.current.panelOpen).toBe(false);
  });

  it("returns empty state when config.period = false", () => {
    const { result } = renderHook(() => useFilterPanel({ period: false }));

    expect(result.current.state.period).toBe("");
    expect(result.current.state.dateFrom).toBe("");
    expect(result.current.state.dateTo).toBe("");
  });

  it("setPeriod updates period and auto-sets dateFrom/dateTo", () => {
    const { result } = renderHook(() => useFilterPanel({ period: true }));

    actHook(() => {
      result.current.setPeriod("2026-03");
    });

    expect(result.current.state.period).toBe("2026-03");
    expect(result.current.state.dateFrom).toBe("2026-03-01");
    expect(result.current.state.dateTo).toBe("2026-03-31");
  });

  it("setSearchInput debounces — immediate clear, debounced value", () => {
    const { result } = renderHook(() => useFilterPanel({ search: true }));

    // Type something — input updates immediately, state.search stays empty
    actHook(() => {
      result.current.setSearchInput("hello");
    });
    expect(result.current.inputs.search).toBe("hello");
    expect(result.current.state.search).toBe("");

    // After debounce, state.search updates
    actHook(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.state.search).toBe("hello");

    // Clear immediately sets state.search to ""
    actHook(() => {
      result.current.setSearchInput("");
    });
    expect(result.current.inputs.search).toBe("");
    expect(result.current.state.search).toBe("");
  });

  it("setChannel updates channel immediately", () => {
    const { result } = renderHook(() =>
      useFilterPanel({
        channel: {
          label: "Quỹ",
          placeholder: "Chọn quỹ",
          options: [{ value: "fund-1", label: "Quỹ 1" }],
        },
      }),
    );

    actHook(() => {
      result.current.setChannel("fund-1");
    });

    expect(result.current.state.channel).toBe("fund-1");
  });

  it("setStatus updates status immediately", () => {
    const { result } = renderHook(() =>
      useFilterPanel({
        status: {
          options: [{ value: "POSTED", label: "Đã ghi sổ" }],
        },
      }),
    );

    actHook(() => {
      result.current.setStatus("POSTED");
    });

    expect(result.current.state.status).toBe("POSTED");
  });

  it("resetAll resets all values to defaults", () => {
    const { result } = renderHook(() =>
      useFilterPanel({ period: true, search: true }),
    );

    // Change some values
    actHook(() => {
      result.current.setPeriod("2026-01");
      result.current.setSearchInput("test");
      vi.advanceTimersByTime(400);
    });

    expect(result.current.state.period).toBe("2026-01");
    expect(result.current.state.search).toBe("test");

    // Reset
    actHook(() => {
      result.current.resetAll();
    });

    expect(result.current.state.period).toBe("2026-05");
    expect(result.current.state.dateFrom).toBe("2026-05-01");
    expect(result.current.state.dateTo).toBe("2026-05-31");
    expect(result.current.state.search).toBe("");
    expect(result.current.inputs.search).toBe("");
  });

  it("hasActiveFilter is false initially, true after changing a filter", () => {
    const { result } = renderHook(() => useFilterPanel({ period: true }));

    expect(result.current.hasActiveFilter).toBe(false);

    actHook(() => {
      result.current.setChannel("fund-1");
    });

    expect(result.current.hasActiveFilter).toBe(true);
  });

  it("activeFilterCount counts correctly", () => {
    const { result } = renderHook(() =>
      useFilterPanel({
        search: true,
        channel: {
          label: "Quỹ",
          placeholder: "Chọn quỹ",
          options: [{ value: "fund-1", label: "Quỹ 1" }],
        },
      }),
    );

    // Initially 0 (no period config, no filters set)
    expect(result.current.activeFilterCount).toBe(0);

    actHook(() => {
      result.current.setChannel("fund-1");
    });
    expect(result.current.activeFilterCount).toBe(1);

    actHook(() => {
      result.current.setSearchInput("abc");
      vi.advanceTimersByTime(400);
    });
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("panelOpen toggles correctly", () => {
    const { result } = renderHook(() => useFilterPanel({}));

    expect(result.current.panelOpen).toBe(false);

    actHook(() => {
      result.current.openPanel();
    });
    expect(result.current.panelOpen).toBe(true);

    actHook(() => {
      result.current.closePanel();
    });
    expect(result.current.panelOpen).toBe(false);

    actHook(() => {
      result.current.togglePanel();
    });
    expect(result.current.panelOpen).toBe(true);

    actHook(() => {
      result.current.togglePanel();
    });
    expect(result.current.panelOpen).toBe(false);
  });
});
