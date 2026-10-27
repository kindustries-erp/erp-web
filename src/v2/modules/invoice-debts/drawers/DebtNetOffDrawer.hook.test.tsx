import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { NetOffOpenInvoice } from "../domain/rules/debtNetOffRules";

const mutate = vi.fn();
const invoicesState: {
  data: NetOffOpenInvoice[] | undefined;
  isLoading: boolean;
  isError: boolean;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
};

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
vi.mock("../api/queries/useDebtNetOffInvoicesQuery", () => ({
  useDebtNetOffInvoicesQuery: () => invoicesState,
}));
vi.mock("../api/mutations/useDebtNetOffMutation", () => ({
  useDebtNetOffMutation: () => ({ mutate, isPending: false }),
}));

import { useDebtNetOffDrawer } from "./DebtNetOffDrawer.hook";

const transaction = {
  id: "txn-1",
  transDate: "2026-10-20",
  referenceNumber: "FT1",
  description: "Thanh toan",
  unallocatedAmount: 1000,
};

const invoice = (id: string, balanceAmount: number): NetOffOpenInvoice => ({
  id,
  invoiceNo: id,
  invoiceDate: "2026-10-01",
  totalAmount: balanceAmount,
  balanceAmount,
  taxInvoiceStatus: 1,
});

const baseProps = {
  open: true,
  onClose: vi.fn(),
  taxCode: "0100000001",
  partnerType: "SUPPLIER" as const,
  transaction,
};

describe("useDebtNetOffDrawer", () => {
  beforeEach(() => {
    mutate.mockClear();
    invoicesState.data = [invoice("inv-a", 700), invoice("inv-b", 400)];
    invoicesState.isLoading = false;
  });

  it("gợi ý số tiền bằng phần nhỏ hơn giữa số dư và số chưa phân bổ còn lại", () => {
    const { result } = renderHook(() => useDebtNetOffDrawer(baseProps));

    act(() => result.current.toggleInvoice(invoice("inv-a", 700)));
    act(() => result.current.toggleInvoice(invoice("inv-b", 400)));

    expect(result.current.amounts).toEqual({ "inv-a": 700, "inv-b": 300 });
    expect(result.current.remainingAmount).toBe(0);
    expect(result.current.validationError).toBeNull();
    expect(result.current.canSave).toBe(true);
  });

  it("khóa lưu khi vượt số dư của hóa đơn", () => {
    const { result } = renderHook(() => useDebtNetOffDrawer(baseProps));

    act(() => result.current.toggleInvoice(invoice("inv-a", 700)));
    act(() => result.current.setAmount("inv-a", 800));

    expect(result.current.validationError).toBe("overBalance");
    expect(result.current.canSave).toBe(false);
  });

  it("gửi đúng payload cấn trừ khi đủ điều kiện", () => {
    const { result } = renderHook(() => useDebtNetOffDrawer(baseProps));

    act(() => result.current.toggleInvoice(invoice("inv-a", 700)));
    act(() => result.current.setAmount("inv-a", 250));
    act(() => result.current.submit());

    expect(mutate).toHaveBeenCalledWith({
      taxCode: "0100000001",
      body: {
        partnerType: "SUPPLIER",
        bankTransactionId: "txn-1",
        allocations: [{ invoiceId: "inv-a", amount: 250 }],
      },
    });
  });

  it("không gửi khi chưa chọn hóa đơn nào", () => {
    const { result } = renderHook(() => useDebtNetOffDrawer(baseProps));

    act(() => result.current.submit());

    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.canSave).toBe(false);
  });
});
