import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGoodsReceiptKeys } from "../api/goodsReceiptKeys";
import type { GoodsReceiptApi } from "../api/goodsReceiptApi.type";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import { useGoodsReceiptDrawerData } from "./GoodsReceiptDrawer.data.hook";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/v2/shared/stores/useV2ToastStore", () => ({
  useV2ToastStore: { getState: () => ({ showToast }) },
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

const get = vi.fn();
const nextCode = vi.fn();
const api = { get, nextCode } as unknown as GoodsReceiptApi;
const config = {
  api,
  keys: createGoodsReceiptKeys(["v2-test-drawer"]),
  tableId: "test-table",
  permissionCollection: "test",
  requiredFields: ["receiptDate"],
  viewVisibility: {},
} as unknown as GoodsReceiptModuleConfig;

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useGoodsReceiptDrawerData", () => {
  beforeEach(() => {
    get.mockReset();
    nextCode.mockReset();
    showToast.mockReset();
  });

  it("phiếu mới: lấy mã tự sinh và giữ form rỗng", async () => {
    nextCode.mockResolvedValue({ nextCode: "GGR-20261104-007" });

    const { result } = renderHook(
      () => useGoodsReceiptDrawerData({ config, open: true, recordId: null }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() =>
      expect(result.current.form.receiptNo).toBe("GGR-20261104-007"),
    );
    expect(result.current.creating).toBe(true);
    expect(result.current.form.lines).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it("phiếu có sẵn: tải chi tiết và đổ vào form", async () => {
    get.mockResolvedValue({
      id: "r1",
      receiptNo: "GGR-1",
      receiptDate: "2026-11-01",
      status: "POSTED",
      lines: [],
    });

    const { result } = renderHook(
      () => useGoodsReceiptDrawerData({ config, open: true, recordId: "r1" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.form.receiptNo).toBe("GGR-1"));
    expect(get).toHaveBeenCalledWith("r1");
    expect(nextCode).not.toHaveBeenCalled();
    expect(result.current.form.status).toBe("POSTED");
  });

  it("regenerateCode gán mã mới vào form", async () => {
    nextCode
      .mockResolvedValueOnce({ nextCode: "GGR-A" })
      .mockResolvedValueOnce({ nextCode: "GGR-B" });

    const { result } = renderHook(
      () => useGoodsReceiptDrawerData({ config, open: true, recordId: null }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.form.receiptNo).toBe("GGR-A"));

    act(() => result.current.regenerateCode());

    await waitFor(() => expect(result.current.form.receiptNo).toBe("GGR-B"));
  });

  it("lỗi tải chi tiết: hiện toast destructive", async () => {
    get.mockRejectedValue(new Error("boom"));

    renderHook(
      () => useGoodsReceiptDrawerData({ config, open: true, recordId: "r1" }),
      {
        wrapper: makeWrapper(),
      },
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" }),
      ),
    );
  });
});
