import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listCashBooks, createManual } = vi.hoisted(() => ({
  listCashBooks: vi.fn(),
  createManual: vi.fn(),
}));

vi.mock("../api/cashVouchersApi", () => ({
  cashVouchersV2Api: { listCashBooks, createManual },
}));

import { useCashVoucherDrawer } from "./CashVoucherDrawer.hook";

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const renderDrawer = (fallbackBranchId: string | null) => {
  const onCreated = vi.fn();
  const hook = renderHook(
    () =>
      useCashVoucherDrawer({
        open: true,
        onClose: vi.fn(),
        onCreated,
        fallbackBranchId,
      }),
    { wrapper: makeWrapper() },
  );
  return { ...hook, onCreated };
};

describe("useCashVoucherDrawer", () => {
  beforeEach(() => {
    listCashBooks.mockReset();
    createManual.mockReset();
    createManual.mockResolvedValue({ id: "txn-new" });
  });

  it("gửi chi nhánh của sổ quỹ đã chọn, không dùng chi nhánh đang chọn đã cũ", async () => {
    listCashBooks.mockResolvedValue([
      { id: "cb-dt", name: "Quỹ ĐT", branchId: "branch-dt" },
    ]);
    const { result, onCreated } = renderDrawer("branch-stale");
    await waitFor(() => expect(result.current.cashBooks).toHaveLength(1));

    act(() => {
      result.current.setField("cashBookId", "cb-dt");
      result.current.setField("transDate", "2026-10-01");
      result.current.setField("receiptAmount", 500);
    });
    act(() => result.current.submit());

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(createManual).toHaveBeenCalledWith({
      branchId: "branch-dt",
      sourceType: "CASH",
      cashBookId: "cb-dt",
      transDate: "2026-10-01",
      creditAmount: 500,
      debitAmount: 0,
      description: "",
      correspondentName: "",
    });
  });

  it("dùng chi nhánh đang chọn khi sổ quỹ chưa có chi nhánh", async () => {
    listCashBooks.mockResolvedValue([
      { id: "cb-x", name: "Quỹ X", branchId: null },
    ]);
    const { result, onCreated } = renderDrawer("branch-current");
    await waitFor(() => expect(result.current.cashBooks).toHaveLength(1));

    act(() => {
      result.current.setField("cashBookId", "cb-x");
      result.current.setField("transDate", "2026-10-01");
      result.current.setField("paymentAmount", 200);
    });
    act(() => result.current.submit());

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(createManual.mock.calls[0][0]).toMatchObject({
      branchId: "branch-current",
      debitAmount: 200,
      creditAmount: 0,
    });
  });

  it("không gọi API khi thiếu thông tin", async () => {
    listCashBooks.mockResolvedValue([]);
    const { result } = renderDrawer(null);
    act(() => result.current.submit());
    expect(result.current.errorField).toBe("cashBookId");
    expect(createManual).not.toHaveBeenCalled();
  });
});
