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
    {
      key: "all",
      label: "Tất cả",
      filters: {},
      columnVisibility: { colA: true, colB: false },
    },
    {
      key: "confirmed",
      label: "Đã xác nhận",
      filters: { status: "CONFIRMED" },
      columnVisibility: { colA: true, colB: true },
    },
  ];

  beforeEach(() => {
    useUserPreferencesStore.setState({ tables: {} });
  });

  it("merges default presets when no custom presets exist with isDefault=true and isCustom=false", () => {
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
      }),
    );

    expect(result.current.presets).toHaveLength(2);
    expect(result.current.activePreset?.key).toBe("all");
    expect(result.current.presets[0].isDefault).toBe(true);
    expect(result.current.presets[0].isCustom).toBe(false);
    expect(result.current.presets[1].isDefault).toBe(true);
    expect(result.current.presets[1].isCustom).toBe(false);
  });

  it("allows editing a default preset without converting it to deletable custom preset", () => {
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
      result.current.saveView(
        "Tất cả (Đã tùy chỉnh)",
        {},
        {},
        {},
        { colA: false, colB: true, colC: true },
        "all",
      );
    });

    expect(result.current.presets).toHaveLength(2);
    const editedPreset = result.current.presets.find((p) => p.key === "all");
    expect(editedPreset).toBeDefined();
    expect(editedPreset?.label).toBe("Tất cả (Đã tùy chỉnh)");
    expect(editedPreset?.columnVisibility).toEqual({
      colA: false,
      colB: true,
      colC: true,
    });
    expect(editedPreset?.isDefault).toBe(true);
    expect(editedPreset?.isCustom).toBe(false);
    expect(editedPreset?.isModified).toBe(true);
  });

  it("prevents deleting a default preset", () => {
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
      }),
    );

    act(() => {
      result.current.deleteView("all");
    });

    expect(result.current.presets).toHaveLength(2);
    expect(result.current.presets.some((p) => p.key === "all")).toBe(true);
  });

  it("allows resetting an edited default preset back to original default", () => {
    const onViewChange = vi.fn();
    const { result } = renderHook(() =>
      usePageViewPresets({
        tableId,
        defaultPresets,
        activeView: "all",
        onViewChange,
      }),
    );

    // 1. Edit default preset
    act(() => {
      result.current.saveView(
        "Tất cả đã sửa",
        {},
        {},
        {},
        { colA: false },
        "all",
      );
    });
    expect(result.current.presets.find((p) => p.key === "all")?.label).toBe(
      "Tất cả đã sửa",
    );

    // 2. Reset default preset
    act(() => {
      result.current.resetView("all");
    });

    const resetPreset = result.current.presets.find((p) => p.key === "all");
    expect(resetPreset?.label).toBe("Tất cả");
    expect(resetPreset?.columnVisibility).toEqual({ colA: true, colB: false });
    expect(resetPreset?.isModified).toBe(false);
    expect(onViewChange).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "all",
        label: "Tất cả",
        isDefault: true,
        isCustom: false,
      }),
    );
  });

  it("allows saving and deleting a custom view preset", () => {
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
    const customView = result.current.presets.find((p) => p.isCustom);
    expect(customView?.label).toBe("Đơn tháng này");
    expect(customView?.isDefault).toBe(false);
    expect(customView?.isCustom).toBe(true);

    const savedKey = customView?.key;
    expect(savedKey).toBeDefined();

    act(() => {
      if (savedKey) result.current.deleteView(savedKey);
    });

    expect(result.current.presets).toHaveLength(2);
    expect(
      result.current.presets.find((p) => p.key === savedKey),
    ).toBeUndefined();
  });
});
