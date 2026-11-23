import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { createGoodsReceiptKeys } from "../goodsReceiptKeys";
import type { GoodsReceiptApi } from "../goodsReceiptApi.type";
import { useGoodsReceiptsQuery } from "./useGoodsReceiptsQuery";

const list = vi.fn();
const api = { list } as unknown as GoodsReceiptApi;
const keys = createGoodsReceiptKeys(["v2-test-goods-receipts"]);

const query = {
  page: 1,
  pageSize: 20,
  search: "",
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
} as unknown as V2TableQuery;

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useGoodsReceiptsQuery", () => {
  it("trả về danh sách và tổng từ API", async () => {
    list.mockResolvedValue({
      items: [{ id: "r1", receiptNo: "GGR-1" }],
      total: 1,
    });

    const { result } = renderHook(
      () => useGoodsReceiptsQuery({ api, keys, query }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.total).toBe(1));
    expect(result.current.items).toHaveLength(1);
    expect(list).toHaveBeenCalledWith(query);
  });

  it("gọi onError khi tải danh sách lỗi", async () => {
    const error = new Error("network");
    list.mockRejectedValue(error);
    const onError = vi.fn();

    renderHook(() => useGoodsReceiptsQuery({ api, keys, query, onError }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
