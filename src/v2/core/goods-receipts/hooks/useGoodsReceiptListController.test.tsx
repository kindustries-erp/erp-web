import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createGoodsReceiptKeys } from "../api/goodsReceiptKeys";
import type { GoodsReceiptApi } from "../api/goodsReceiptApi.type";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import { useGoodsReceiptListController } from "./useGoodsReceiptListController";

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: ({ action }: { action: string }) => action !== "delete",
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

const config = {
  api: {} as GoodsReceiptApi,
  keys: createGoodsReceiptKeys(["v2-test-list"]),
  tableId: "test-list-table",
  permissionCollection: "test_collection",
  requiredFields: ["receiptDate"],
  viewVisibility: {
    overview: { receiptNo: true, remarks: false },
    all: { receiptNo: true, remarks: true },
  },
} as unknown as GoodsReceiptModuleConfig;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useGoodsReceiptListController", () => {
  it("đọc quyền theo collection của cấu hình và mở drawer theo id", () => {
    const { result } = renderHook(() => useGoodsReceiptListController(config), {
      wrapper,
    });

    expect(result.current.canCreate).toBe(true);
    expect(result.current.canUpdate).toBe(true);
    expect(result.current.drawer).toBeNull();

    act(() => result.current.open("r1", "view"));
    expect(result.current.drawer).toEqual({ id: "r1", mode: "view" });
  });

  it("đổi chế độ xem tăng khóa bảng để làm mới cột", () => {
    const { result } = renderHook(() => useGoodsReceiptListController(config), {
      wrapper,
    });
    const before = result.current.tableKey;

    act(() => result.current.selectView("all"));

    expect(result.current.view).toBe("all");
    expect(result.current.tableKey).toBe(before + 1);
  });
});
