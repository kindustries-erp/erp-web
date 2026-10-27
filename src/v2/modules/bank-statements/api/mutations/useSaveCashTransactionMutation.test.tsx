import { act, renderHook, waitFor } from "@testing-library/react";
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

import { useSaveCashTransactionMutation } from "./useSaveCashTransactionMutation";

const POST_PAYLOAD = {
  postingDate: "2026-10-27",
  lines: [{ accountId: "1111", debit: 100, credit: 0 }],
};

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

describe("useSaveCashTransactionMutation", () => {
  beforeEach(() => {
    [updateTransaction, postTransaction, unpostTransaction].forEach((fn) =>
      fn.mockReset(),
    );
  });

  it("không có thay đổi và không hạch toán thì không gọi API", async () => {
    const { client } = makeClient();
    const { result } = renderHook(() => useSaveCashTransactionMutation(), {
      wrapper: wrapperFor(client),
    });
    await act(() =>
      result.current.mutateAsync({
        transactionId: "t1",
        infoPatch: null,
        accounting: { mode: "SKIP" },
      }),
    );
    expect(updateTransaction).not.toHaveBeenCalled();
    expect(postTransaction).not.toHaveBeenCalled();
  });

  it("lưu thông tin trước, rồi mới hạch toán", async () => {
    updateTransaction.mockResolvedValue({});
    postTransaction.mockResolvedValue({ id: "t1" });
    const { client } = makeClient();
    const { result } = renderHook(() => useSaveCashTransactionMutation(), {
      wrapper: wrapperFor(client),
    });
    await act(() =>
      result.current.mutateAsync({
        transactionId: "t1",
        infoPatch: { note: "mới" },
        accounting: { mode: "POST", payload: POST_PAYLOAD },
      }),
    );
    expect(updateTransaction.mock.invocationCallOrder[0]).toBeLessThan(
      postTransaction.mock.invocationCallOrder[0],
    );
    expect(postTransaction).toHaveBeenCalledWith("t1", POST_PAYLOAD);
  });

  it("lỗi cập nhật thông tin mang step UPDATE_INFO và không hạch toán", async () => {
    updateTransaction.mockRejectedValue({
      response: { data: { message: "Sai chi nhánh" } },
    });
    const { client } = makeClient();
    const { result } = renderHook(() => useSaveCashTransactionMutation(), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await result.current
        .mutateAsync({
          transactionId: "t1",
          infoPatch: { note: "x" },
          accounting: { mode: "POST", payload: POST_PAYLOAD },
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error).toMatchObject({
      step: "UPDATE_INFO",
      serverMessage: "Sai chi nhánh",
    });
    expect(postTransaction).not.toHaveBeenCalled();
  });

  it("thông tin đã lưu nhưng hạch toán lỗi thì mang step POST", async () => {
    updateTransaction.mockResolvedValue({});
    postTransaction.mockRejectedValue(new Error("Hạch toán không cân bằng"));
    const { client } = makeClient();
    const { result } = renderHook(() => useSaveCashTransactionMutation(), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await result.current
        .mutateAsync({
          transactionId: "t1",
          infoPatch: { note: "x" },
          accounting: { mode: "POST", payload: POST_PAYLOAD },
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error).toMatchObject({
      step: "POST",
      serverMessage: "Hạch toán không cân bằng",
    });
  });

  it("bỏ hạch toán gọi unpost và làm mới chi tiết sau khi xong", async () => {
    unpostTransaction.mockResolvedValue({});
    const { client, invalidate } = makeClient();
    const { result } = renderHook(() => useSaveCashTransactionMutation(), {
      wrapper: wrapperFor(client),
    });
    await act(() =>
      result.current.mutateAsync({
        transactionId: "t1",
        infoPatch: null,
        accounting: { mode: "UNPOST" },
      }),
    );
    expect(unpostTransaction).toHaveBeenCalledWith("t1");
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["bank-transaction", "t1"],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["bank-transactions"],
    });
  });
});
