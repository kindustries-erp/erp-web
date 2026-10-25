import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { TFunction } from "i18next";
import { useVinfastPartsStockActions } from "./VinfastPartsStockTable.actions";

const t = ((key: string, fallback?: string) =>
  fallback ?? key) as unknown as TFunction;

type MenuGroup = {
  groupLabel: string;
  items: Array<{ label: string; onClick?: () => void }>;
};

const renderActions = (onOpenExport = vi.fn(), onOpenSync = vi.fn()) =>
  renderHook(() =>
    useVinfastPartsStockActions({
      t,
      vehicleType: "oto",
      stockTab: "ALL",
      setStockTab: vi.fn(),
      onSelectSku: vi.fn(),
      onOpenSync,
      onOpenExport,
    }),
  ).result.current;

describe("useVinfastPartsStockActions createActions", () => {
  it("keeps only the TRA CỨU group with Xuất Excel in the menu", () => {
    const { createActions } = renderActions();

    const groups = createActions as unknown as MenuGroup[];

    expect(groups).toHaveLength(1);
    expect(groups[0].groupLabel).toBe("TRA CỨU");
    expect(groups[0].items.map((item) => item.label)).toEqual(["Xuất Excel"]);
  });

  it("opens the export drawer when Xuất Excel is clicked", () => {
    const onOpenExport = vi.fn();
    const { createActions } = renderActions(onOpenExport);

    const groups = createActions as unknown as MenuGroup[];
    groups[0].items[0].onClick?.();

    expect(onOpenExport).toHaveBeenCalledTimes(1);
  });
});
