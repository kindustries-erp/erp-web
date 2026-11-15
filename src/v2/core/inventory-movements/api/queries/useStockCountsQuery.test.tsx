import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createInventoryMovementsKeys } from "../inventoryMovementsKeys";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import {
  useStockTabCountsQuery,
  useStockVoucherTypeCountsQuery,
} from "./useStockCountsQuery";

const keys = createInventoryMovementsKeys(["test-counts"]);

function wrap() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function makeApi(overrides: Partial<InventoryMovementsApi>) {
  return {
    listVouchers: vi.fn(),
    voucherOptions: vi.fn(),
    getVoucher: vi.fn(),
    listBalances: vi.fn(),
    listTransactions: vi.fn(),
    ...overrides,
  } as unknown as InventoryMovementsApi & {
    listVouchers: ReturnType<typeof vi.fn>;
    listBalances: ReturnType<typeof vi.fn>;
  };
}

describe("useStockVoucherTypeCountsQuery", () => {
  it("trả số phiếu theo loại từ listVouchers", async () => {
    const api = makeApi({});
    api.listVouchers.mockResolvedValue({
      items: [],
      total: 0,
      typeCounts: { PURCHASE_RECEIPT: 3, ISSUE: 0 },
    });
    const { result } = renderHook(
      () => useStockVoucherTypeCountsQuery({ api, keys }),
      { wrapper: wrap() },
    );
    await waitFor(() =>
      expect(result.current).toEqual({ PURCHASE_RECEIPT: 3, ISSUE: 0 }),
    );
    expect(api.listVouchers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 1 }),
    );
  });

  it("trả object rỗng khi chưa có dữ liệu", () => {
    const api = makeApi({});
    api.listVouchers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(
      () => useStockVoucherTypeCountsQuery({ api, keys }),
      { wrapper: wrap() },
    );
    expect(result.current).toEqual({});
  });
});

describe("useStockTabCountsQuery", () => {
  it("đọc extraData.tabCounts và luôn truy vấn với tab ALL", async () => {
    const api = makeApi({});
    api.listBalances.mockResolvedValue({
      items: [],
      total: 0,
      extraData: { tabCounts: { ALL: 6, IN_STOCK: 4 } },
    });
    const { result } = renderHook(() => useStockTabCountsQuery({ api, keys }), {
      wrapper: wrap(),
    });
    await waitFor(() =>
      expect(result.current).toEqual({ ALL: 6, IN_STOCK: 4 }),
    );
    expect(api.listBalances).toHaveBeenCalledWith(expect.anything(), "ALL");
  });
});
