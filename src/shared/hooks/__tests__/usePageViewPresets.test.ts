import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageViewPresets } from "../usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "../useUserPreferences";

describe("usePageViewPresets", () => {
  const tableId = "test-table-presets";
  const defaultPresets: TableViewPreset[] = [
    { key: "all", label: "Tất cả", filters: {} },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      filters: { status: "CONFIRMED" },
    },
  ];

  beforeEach(() => {
    useUserPreferencesStore.setState({ tables: {} });
  });

  it("merges default presets when no custom presets exist", () => {
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
      }),
    );

    expect(result.current.presets).toHaveLength(2);
    expect(result.current.activePreset?.key).toBe("all");
  });

  it("allows saving a custom view preset into user preferences", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
        onViewChange,
      }),
    );

    act(() => {
      result.current.saveView("Đơn tháng này", {
        dateFrom: "2026-08-01",
        dateTo: "2026-08-31",
      });
    });

    expect(result.current.presets.length).toBe(3);
    expect(onViewChange).toHaveBeenCalled();
    const customView = result.current.presets.find((p) => p.isCustom);
    expect(customView?.label).toBe("Đơn tháng này");
  });

  it("allows deleting a custom view preset", () => {
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
      }),
    );

    act(() => {
      result.current.saveView("Xóa thử", { status: "DRAFT" });
    });

    const savedKey = result.current.presets.find(
      (p) => p.label === "Xóa thử",
    )?.key;
    expect(savedKey).toBeDefined();

    act(() => {
      if (savedKey) result.current.deleteView(savedKey);
    });

    expect(result.current.presets).toHaveLength(2);
  });
});
