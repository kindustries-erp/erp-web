import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createPurchaseOrderKeys } from "../api/purchaseOrderKeys";
import type { PurchaseOrderApi } from "../api/purchaseOrderApi.type";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import { usePurchaseOrderListController } from "./usePurchaseOrderListController";

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: ({ action }: { action: string }) => action !== "delete",
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

const config = {
  api: {} as PurchaseOrderApi,
  keys: createPurchaseOrderKeys(["v2-test-po-list"]),
  tableId: "test-po-list-table",
  permissionCollection: "test_collection",
  requiredFields: ["orderDate"],
  viewVisibility: {
    overview: { poNo: true, remarks: false },
    all: { poNo: true, remarks: true },
  },
} as unknown as PurchaseOrderModuleConfig;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("usePurchaseOrderListController", () => {
  it("đọc quyền theo collection của cấu hình và mở drawer theo id", () => {
    const { result } = renderHook(
      () => usePurchaseOrderListController(config),
      {
        wrapper,
      },
    );

    expect(result.current.canCreate).toBe(true);
    expect(result.current.canUpdate).toBe(true);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.drawer).toBeNull();

    act(() => result.current.open("p1", "view"));
    expect(result.current.drawer).toEqual({ id: "p1", mode: "view" });
  });

  it("đổi chế độ xem tăng khóa bảng để làm mới cột", () => {
    const { result } = renderHook(
      () => usePurchaseOrderListController(config),
      {
        wrapper,
      },
    );
    const before = result.current.tableKey;

    act(() => result.current.selectView("all"));

    expect(result.current.view).toBe("all");
    expect(result.current.tableKey).toBe(before + 1);
  });

  it("hủy đơn từ menu chỉ mở modal, chưa gọi API cho tới khi xác nhận", async () => {
    const api = {
      cancel: vi.fn().mockResolvedValue({ id: "p1" }),
    } as unknown as PurchaseOrderApi;
    const { result } = renderHook(
      () => usePurchaseOrderListController({ ...config, api }),
      { wrapper },
    );
    const row = { id: "p1", poNo: "GPO-1", status: "APPROVED" } as never;

    act(() => result.current.setCancelTarget(row));
    expect(result.current.cancelTarget).toEqual(row);
    expect(api.cancel).not.toHaveBeenCalled();

    act(() => result.current.confirmCancel());
    await waitFor(() => expect(api.cancel).toHaveBeenCalledWith("p1"));
  });
});
