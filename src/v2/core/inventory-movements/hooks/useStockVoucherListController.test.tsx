import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { InventoryMovementsModuleConfig } from "../inventoryMovements.config.type";
import { useStockVoucherListController } from "./useStockVoucherListController";

vi.mock("@/v2/shared/preferences/v2TablePreferenceStorages", async (orig) => ({
  ...(await orig<object>()),
  applyV2SystemView: vi.fn(),
}));

const visibility = {
  overview: { voucherNo: true },
  all: { voucherNo: true, remarks: true },
};

const config = {
  voucherTableId: "test-vouchers-table",
  voucherViewVisibility: visibility,
  voucherTypes: [
    {
      code: "ISSUE",
      labelKey: "v2.test.issue",
      labelFallback: "Xuất kho",
      direction: "OUT",
    },
  ],
} as unknown as InventoryMovementsModuleConfig;

describe("useStockVoucherListController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useV2TablePreferencesStore.setState({ tables: {} });
    useV2ToastStore.setState({ showToast: vi.fn() } as never);
  });

  it("áp chế độ Tổng quan khi bảng chưa có cấu hình cột", () => {
    renderHook(() => useStockVoucherListController(config, vi.fn()));
    expect(applyV2SystemView).toHaveBeenCalledWith(
      "test-vouchers-table",
      "overview",
      visibility.overview,
    );
  });

  it("dựng đủ cột danh sách chứng từ (hành vi mở chi tiết kiểm ở file cột)", () => {
    const { result } = renderHook(() =>
      useStockVoucherListController(config, vi.fn()),
    );
    const keys = result.current.columns.map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining(["voucherNo", "type", "status", "totalAmount"]),
    );
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("selectView đổi chế độ, áp cấu hình cột và tăng tableKey", () => {
    const { result } = renderHook(() =>
      useStockVoucherListController(config, vi.fn()),
    );
    const before = result.current.tableKey;
    act(() => result.current.selectView("all"));
    expect(result.current.view).toBe("all");
    expect(applyV2SystemView).toHaveBeenLastCalledWith(
      "test-vouchers-table",
      "all",
      visibility.all,
    );
    expect(result.current.tableKey).toBe(before + 1);
  });

  it("onListError hiện toast đỏ khi tải danh sách lỗi", () => {
    const { result } = renderHook(() =>
      useStockVoucherListController(config, vi.fn()),
    );
    act(() => result.current.onListError(new Error("boom")));
    expect(useV2ToastStore.getState().showToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });
});
