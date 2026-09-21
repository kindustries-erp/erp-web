// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  ErpInvoiceSettlementProvider,
  useErpInvoiceSettlement,
} from "../context/ErpInvoiceSettlementContext";
import { erpInvoicesCoreApi } from "../../../api/erpInvoicesCoreApi";

vi.mock("../../../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    get: vi.fn(),
    linkVouchers: vi.fn().mockResolvedValue({ success: true }),
    removeVoucherLink: vi.fn().mockResolvedValue({ success: true }),
    getSmartNetOffSuggestions: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn().mockResolvedValue({
      items: [
        {
          id: "txn-1",
          transDate: "2026-09-01",
          creditAmount: 500000,
          debitAmount: 0,
          netOffAmount: 0,
          description: "Thu tiền bán hàng",
          referenceNumber: "REF-001",
        },
      ],
      total: 1,
      totalPages: 1,
      page: 1,
      pageSize: 50,
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal || key,
  }),
}));

describe("ErpInvoiceSettlementContext", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it("provides debt progress and tracks selected transactions correctly", async () => {
    const invoice = {
      id: "inv-100",
      invoiceNo: "100",
      totalAmount: "1000000",
      voucherNetOffs: [
        {
          id: "v-1",
          bankTransactionId: "txn-old",
          netOffAmount: 400000,
          bankTransaction: {
            id: "txn-old",
            referenceNumber: "OLD-REF",
            bankName: "BIDV",
          },
        },
      ],
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErpInvoiceSettlementProvider
          invoice={invoice as any}
          editMode={false}
          direction="OUT"
        >
          {children}
        </ErpInvoiceSettlementProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useErpInvoiceSettlement(), { wrapper });

    expect(result.current.totalInvoiceAmount).toBe(1000000);
    expect(result.current.totalNetOff).toBe(400000);
    expect(result.current.remainingDebt).toBe(600000);
    expect(result.current.paymentPercent).toBe(40);
    expect(result.current.isPaidFull).toBe(false);
    expect(result.current.activeVouchers).toHaveLength(1);
    expect(result.current.activeVouchers[0].sourceType).toBe("BANK");
    expect(result.current.viewPreset).toBe("linked");

    // Toggle row selection
    const mockTxn = {
      id: "txn-1",
      creditAmount: "500000",
      debitAmount: "0",
      netOffAmount: "0",
    };

    act(() => {
      result.current.handleToggleRow(mockTxn);
    });

    expect(result.current.selectedIds).toContain("txn-1");
    expect(result.current.netOffAmounts["txn-1"]).toBe(500000);
    expect(result.current.totalCurrentNetOff).toBe(500000);
    expect(result.current.remainingAfterNetOff).toBe(100000);
    expect(result.current.isOverRemaining).toBe(false);

    // Confirm NetOff
    await act(async () => {
      await result.current.handleConfirmNetOff();
    });

    expect(erpInvoicesCoreApi.linkVouchers).toHaveBeenCalledWith("inv-100", [
      {
        bankTransactionId: "txn-1",
        netOffAmount: 500000,
      },
    ]);
  });

  it("switches sub-tabs between bank_statement and cash_book", () => {
    const invoice = {
      id: "inv-100",
      invoiceNo: "100",
      totalAmount: "1000000",
      voucherNetOffs: [],
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErpInvoiceSettlementProvider
          invoice={invoice as any}
          editMode={false}
          direction="OUT"
        >
          {children}
        </ErpInvoiceSettlementProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useErpInvoiceSettlement(), { wrapper });

    expect(result.current.activeSubTab).toBe("bank_statement");

    act(() => {
      result.current.setActiveSubTab("cash_book");
    });

    expect(result.current.activeSubTab).toBe("cash_book");
  });

  it("switches view presets correctly for unified table (all, suggestions, selected, linked)", () => {
    const invoice = {
      id: "inv-100",
      invoiceNo: "100",
      totalAmount: "1000000",
      voucherNetOffs: [],
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErpInvoiceSettlementProvider
          invoice={invoice as any}
          editMode={false}
          direction="OUT"
        >
          {children}
        </ErpInvoiceSettlementProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useErpInvoiceSettlement(), { wrapper });

    expect(result.current.viewPreset).toBe("all");

    act(() => {
      result.current.setViewPreset("suggestions");
    });
    expect(result.current.viewPreset).toBe("suggestions");

    act(() => {
      result.current.setViewPreset("selected");
    });
    expect(result.current.viewPreset).toBe("selected");

    act(() => {
      result.current.setViewPreset("linked");
    });
    expect(result.current.viewPreset).toBe("linked");
  });

  it("syncs selected bank transactions to form.pendingDocumentChanges when form and fieldSet props are provided", () => {
    const invoice = {
      id: "inv-100",
      invoiceNo: "100",
      totalAmount: "1000000",
      voucherNetOffs: [],
    };

    let pendingChanges: any[] = [];
    const mockForm = {
      pendingDocumentChanges: pendingChanges,
    };
    const mockFieldSet = vi.fn((key: string, val: any) => {
      if (key === "pendingDocumentChanges") {
        pendingChanges = val;
        mockForm.pendingDocumentChanges = pendingChanges;
      }
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ErpInvoiceSettlementProvider
          invoice={invoice as any}
          form={mockForm as any}
          fieldSet={mockFieldSet}
          editMode={true}
          direction="OUT"
        >
          {children}
        </ErpInvoiceSettlementProvider>
      </QueryClientProvider>
    );

    const { result, rerender } = renderHook(() => useErpInvoiceSettlement(), {
      wrapper,
    });

    // Toggle a transaction row
    const mockTxn = {
      id: "txn-1",
      creditAmount: "500000",
      debitAmount: "0",
      netOffAmount: "0",
      referenceNumber: "REF-001",
      bankName: "BIDV",
      transDate: "2026-09-01",
    };

    act(() => {
      result.current.handleToggleRow(mockTxn);
    });

    expect(result.current.selectedIds).toContain("txn-1");
    // Verify fieldSet was called with the ADD bank voucher item
    expect(mockFieldSet).toHaveBeenCalledWith(
      "pendingDocumentChanges",
      expect.arrayContaining([
        expect.objectContaining({
          action: "ADD",
          type: "BANK",
          refId: "txn-1",
          amount: 500000,
        }),
      ]),
    );

    rerender();

    // Active vouchers should now include the pending voucher with isPending: true
    expect(
      result.current.activeVouchers.some(
        (v) => v.bankTransactionId === "txn-1" && v.isPending,
      ),
    ).toBe(true);

    // Unlinking a pending voucher should remove it without calling backend API
    act(() => {
      result.current.handleUnlinkVoucher({
        id: "pending-bank-txn-1",
        bankTransactionId: "txn-1",
        amount: 500000,
        isPending: true,
      } as any);
    });

    expect(erpInvoicesCoreApi.removeVoucherLink).not.toHaveBeenCalled();
    expect(result.current.selectedIds).not.toContain("txn-1");
  });
});
