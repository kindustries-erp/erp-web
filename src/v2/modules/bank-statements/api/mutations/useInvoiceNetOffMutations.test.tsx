import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  updateTransaction,
  postTransaction,
  unpostTransaction,
  linkInvoice,
  removeInvoice,
} = vi.hoisted(() => ({
  updateTransaction: vi.fn(),
  postTransaction: vi.fn(),
  unpostTransaction: vi.fn(),
  linkInvoice: vi.fn(),
  removeInvoice: vi.fn(),
}));

vi.mock("../cashTransactionApi", () => ({
  cashTransactionApi: {
    updateTransaction,
    postTransaction,
    unpostTransaction,
    linkInvoice,
    removeInvoice,
  },
}));

import { useInvoiceNetOffMutations } from "./useInvoiceNetOffMutations";

const makeClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  return { client, invalidate };
};

const wrapperFor = (client: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

describe("useInvoiceNetOffMutations", () => {
  beforeEach(() => {
    linkInvoice.mockReset();
    removeInvoice.mockReset();
  });

  it("liên kết hóa đơn rồi làm mới chi tiết, đồ thị và danh sách", async () => {
    linkInvoice.mockResolvedValue({ message: "ok" });
    const { client, invalidate } = makeClient();
    const { result } = renderHook(() => useInvoiceNetOffMutations("t1"), {
      wrapper: wrapperFor(client),
    });
    await act(() =>
      result.current.link.mutateAsync({ invoiceId: "i1", netOffAmount: 50 }),
    );
    expect(linkInvoice).toHaveBeenCalledWith("t1", {
      invoiceId: "i1",
      netOffAmount: 50,
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["bank-transaction", "t1"],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["bank-traceability-graph", "t1"],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["bank-transactions"],
    });
  });

  it("gỡ liên kết gọi removeInvoice với id cấn trừ", async () => {
    removeInvoice.mockResolvedValue({ message: "ok" });
    const { client } = makeClient();
    const { result } = renderHook(() => useInvoiceNetOffMutations("t1"), {
      wrapper: wrapperFor(client),
    });
    await act(() => result.current.unlink.mutateAsync("n1"));
    expect(removeInvoice).toHaveBeenCalledWith("t1", "n1");
  });
});
