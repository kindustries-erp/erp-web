import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { InventoryMovementsModuleConfig } from "../inventoryMovements.config.type";
import { useStockBalanceListController } from "./useStockBalanceListController";

vi.mock("@/v2/shared/preferences/v2TablePreferenceStorages", async (orig) => ({
  ...(await orig<object>()),
  applyV2SystemView: vi.fn(),
}));

const visibility = {
  overview: { qtyOnHand: true },
  all: { qtyOnHand: true, qtyReceived: true },
};

const config = {
  balanceTableId: "test-balances-table",
  balanceViewVisibility: visibility,
} as unknown as InventoryMovementsModuleConfig;

describe("useStockBalanceListController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useV2TablePreferencesStore.setState({ tables: {} });
    useV2ToastStore.setState({ showToast: vi.fn() } as never);
  });

  it("mặc định tab ALL, chưa mở thẻ kho nào", () => {
    const { result } = renderHook(() => useStockBalanceListController(config));
    expect(result.current.tab).toBe("ALL");
    expect(result.current.ledger).toBeNull();
    expect(result.current.view).toBe("overview");
  });

  it("áp chế độ xem Tổng quan khi bảng chưa có cấu hình cột", () => {
    renderHook(() => useStockBalanceListController(config));
    expect(applyV2SystemView).toHaveBeenCalledWith(
      "test-balances-table",
      "overview",
      visibility.overview,
    );
  });

  it("selectView đổi chế độ, áp cấu hình cột và tăng tableKey", () => {
    const { result } = renderHook(() => useStockBalanceListController(config));
    const before = result.current.tableKey;
    act(() => result.current.selectView("all"));
    expect(result.current.view).toBe("all");
    expect(applyV2SystemView).toHaveBeenLastCalledWith(
      "test-balances-table",
      "all",
      visibility.all,
    );
    expect(result.current.tableKey).toBe(before + 1);
  });

  it("selectView với chế độ không khai báo thì chỉ đổi view, không áp cột", () => {
    const { result } = renderHook(() => useStockBalanceListController(config));
    vi.mocked(applyV2SystemView).mockClear();
    act(() => result.current.selectView("unknownView"));
    expect(result.current.view).toBe("unknownView");
    expect(applyV2SystemView).not.toHaveBeenCalled();
  });

  it("onListError hiện toast đỏ khi tải lỗi", () => {
    const { result } = renderHook(() => useStockBalanceListController(config));
    act(() => result.current.onListError(new Error("boom")));
    expect(useV2ToastStore.getState().showToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });
});
