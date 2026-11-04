import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createPurchaseOrderKeys } from "../purchaseOrderKeys";
import type { PurchaseOrderApi } from "../purchaseOrderApi.type";
import { usePurchaseOrderMutations } from "./usePurchaseOrderMutations";

const t = (_key: string, fallback?: string) => fallback ?? _key;
const keys = createPurchaseOrderKeys(["v2-test-purchase-orders"]);

const makeApi = (overrides: Partial<PurchaseOrderApi> = {}) =>
  ({
    create: vi.fn().mockResolvedValue({ id: "new" }),
    update: vi.fn().mockResolvedValue({ id: "1" }),
    approve: vi.fn().mockResolvedValue({ id: "1" }),
    confirm: vi.fn().mockResolvedValue({ id: "1" }),
    cancel: vi.fn().mockResolvedValue({ id: "1" }),
    remove: vi.fn().mockResolvedValue({ id: "1" }),
    ...overrides,
  }) as unknown as PurchaseOrderApi;

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const form = {
  poNo: "",
  orderDate: "2026-11-04",
  expectedDate: "",
  supplierName: "",
  branchName: "",
  supplierInvoiceNo: "",
  remarks: "",
  status: "DRAFT",
  paymentStatus: "UNPAID",
  totalAmount: "0",
  lines: [],
} as never;

describe("usePurchaseOrderMutations", () => {
  it("tạo mới khi không có id và gọi create", async () => {
    const api = makeApi();
    const { result } = renderHook(
      () => usePurchaseOrderMutations({ api, keys, t }),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      await result.current.save.mutateAsync({ id: null, form });
    });
    expect(api.create).toHaveBeenCalledWith(form);
    expect(api.update).not.toHaveBeenCalled();
  });

  it("sửa khi có id và gọi update", async () => {
    const api = makeApi();
    const { result } = renderHook(
      () => usePurchaseOrderMutations({ api, keys, t }),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      await result.current.save.mutateAsync({ id: "1", form });
    });
    expect(api.update).toHaveBeenCalledWith("1", form);
  });

  it("duyệt, xác nhận, hủy gọi đúng API và báo onActed", async () => {
    const api = makeApi();
    const onActed = vi.fn();
    const { result } = renderHook(
      () => usePurchaseOrderMutations({ api, keys, t, onActed }),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      await result.current.approve.mutateAsync("1");
    });
    await act(async () => {
      await result.current.confirm.mutateAsync("1");
    });
    await act(async () => {
      await result.current.cancel.mutateAsync("1");
    });

    expect(api.approve).toHaveBeenCalledWith("1");
    expect(api.confirm).toHaveBeenCalledWith("1");
    expect(api.cancel).toHaveBeenCalledWith("1");
    await waitFor(() => expect(onActed).toHaveBeenCalledTimes(3));
  });

  it("xóa gọi remove và báo onRemoved", async () => {
    const api = makeApi();
    const onRemoved = vi.fn();
    const { result } = renderHook(
      () => usePurchaseOrderMutations({ api, keys, t, onRemoved }),
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      await result.current.remove.mutateAsync("1");
    });
    expect(api.remove).toHaveBeenCalledWith("1");
    await waitFor(() => expect(onRemoved).toHaveBeenCalledTimes(1));
  });
});
