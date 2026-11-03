import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getTransaction, listTransactions, getTraceabilityGraph } = vi.hoisted(
  () => ({
    getTransaction: vi.fn(),
    listTransactions: vi.fn(),
    getTraceabilityGraph: vi.fn(),
  }),
);

vi.mock("../cashTransactionApi", () => ({
  cashTransactionApi: {
    getTransaction,
    listTransactions,
    getTraceabilityGraph,
  },
}));

import { useCashTransactionQuery } from "./useCashTransactionQuery";
import { usePartnerTransactionCountQuery } from "./usePartnerTransactionCountQuery";
import { useTraceabilityGraphQuery } from "./useTraceabilityGraphQuery";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe("cashTransaction queries", () => {
  beforeEach(() => {
    getTransaction.mockReset();
    listTransactions.mockReset();
    getTraceabilityGraph.mockReset();
  });

  it("chi tiết không gọi API khi drawer đóng hoặc thiếu id", () => {
    renderHook(() => useCashTransactionQuery("t1", false), { wrapper });
    renderHook(() => useCashTransactionQuery(null, true), { wrapper });
    expect(getTransaction).not.toHaveBeenCalled();
  });

  it("chi tiết tải khi mở và có id", async () => {
    getTransaction.mockResolvedValue({ id: "t1" });
    const { result } = renderHook(() => useCashTransactionQuery("t1", true), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toEqual({ id: "t1" }));
    expect(getTransaction).toHaveBeenCalledWith("t1");
  });

  it("đếm giao dịch đối tác chỉ chạy khi có tài khoản hoặc tên", async () => {
    renderHook(() => usePartnerTransactionCountQuery("", ""), { wrapper });
    expect(listTransactions).not.toHaveBeenCalled();

    listTransactions.mockResolvedValue({ data: [], total: 4 });
    const { result } = renderHook(
      () => usePartnerTransactionCountQuery("", "ACME"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.data?.total).toBe(4));
    expect(listTransactions).toHaveBeenCalledWith({
      page: 1,
      pageSize: 1,
      correspondentAccount: undefined,
      correspondentName: "ACME",
    });
  });

  it("đồ thị chứng từ chỉ tải khi tab mở và có id", async () => {
    renderHook(() => useTraceabilityGraphQuery("t1", false), { wrapper });
    renderHook(() => useTraceabilityGraphQuery(undefined, true), { wrapper });
    expect(getTraceabilityGraph).not.toHaveBeenCalled();

    getTraceabilityGraph.mockResolvedValue({ nodes: [], edges: [] });
    const { result } = renderHook(() => useTraceabilityGraphQuery("t1", true), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(getTraceabilityGraph).toHaveBeenCalledWith("t1");
  });
});
