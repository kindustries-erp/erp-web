import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createPurchaseOrderKeys } from "../api/purchaseOrderKeys";
import type { PurchaseOrderApi } from "../api/purchaseOrderApi.type";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import { usePurchaseOrderDrawerData } from "./PurchaseOrderDrawer.data.hook";

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const makeConfig = (api: Partial<PurchaseOrderApi>) =>
  ({
    api: api as PurchaseOrderApi,
    keys: createPurchaseOrderKeys(["v2-test-drawer-data"]),
    tableId: "t",
    permissionCollection: "c",
    requiredFields: ["orderDate"],
    viewVisibility: {},
  }) as unknown as PurchaseOrderModuleConfig;

describe("usePurchaseOrderDrawerData", () => {
  it("khi tạo mới: lấy số đơn kế tiếp và gán vào form", async () => {
    const nextNo = vi.fn().mockResolvedValue({ nextNo: "GPO-20261104-007" });
    const get = vi.fn();
    const { result } = renderHook(
      () =>
        usePurchaseOrderDrawerData({
          config: makeConfig({ nextNo, get }),
          open: true,
          recordId: null,
        }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() =>
      expect(result.current.form.poNo).toBe("GPO-20261104-007"),
    );
    expect(result.current.creating).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it("khi xem/sửa: tải chi tiết và đổ vào form, ngày cắt về yyyy-mm-dd", async () => {
    const get = vi.fn().mockResolvedValue({
      id: "p1",
      poNo: "GPO-1",
      orderDate: "2026-11-04T00:00:00.000Z",
      status: "APPROVED",
      totalAmount: 500,
      lines: [],
    });
    const nextNo = vi.fn();
    const { result } = renderHook(
      () =>
        usePurchaseOrderDrawerData({
          config: makeConfig({ get, nextNo }),
          open: true,
          recordId: "p1",
        }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.form.poNo).toBe("GPO-1"));
    expect(result.current.form.orderDate).toBe("2026-11-04");
    expect(result.current.form.status).toBe("APPROVED");
    expect(nextNo).not.toHaveBeenCalled();
  });
});
