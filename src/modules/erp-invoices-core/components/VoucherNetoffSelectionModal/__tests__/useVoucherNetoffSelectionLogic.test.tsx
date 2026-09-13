// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useVoucherNetoffSelectionLogic } from "../hooks/useVoucherNetoffSelectionLogic";
import { erpInvoicesCoreApi } from "../../../api/erpInvoicesCoreApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

vi.mock("../../../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    get: vi.fn(),
    getSmartNetOffSuggestions: vi.fn(),
  },
}));

vi.mock("@/modules/bank-statements/api/bankStatementApi", () => ({
  bankStatementApi: {
    getTransactions: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal || key,
  }),
}));

describe("useVoucherNetoffSelectionLogic", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    (erpInvoicesCoreApi.get as any).mockResolvedValue(null);
    (bankStatementApi.getTransactions as any).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    });
    (erpInvoicesCoreApi.getSmartNetOffSuggestions as any).mockResolvedValue({});
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("calculates currentRemaining as 0 when invoice has voucherNetOffs covering 100%", () => {
    const invoice = {
      id: "inv-1236",
      invoiceNo: "1236",
      totalAmount: "4581821",
      voucherNetOffs: [
        {
          id: "v-1",
          bankTransactionId: "txn-1",
          netOffAmount: 4581821,
          bankTransaction: {
            id: "txn-1",
            referenceNumber: "0581AbC8",
            bankName: "BIDV",
          },
        },
      ],
    };

    const { result } = renderHook(
      () =>
        useVoucherNetoffSelectionLogic({
          open: true,
          onClose: vi.fn(),
          invoice,
          invoiceDirection: "OUT",
        }),
      { wrapper },
    );

    expect(result.current.currentRemaining).toBe(0);
    expect(result.current.resolvedTarget?.totalAmount).toBe(4581821);
    expect(result.current.resolvedTarget?.netOffAmount).toBe(4581821);
    expect(result.current.existingInvoiceNetOffs).toHaveLength(1);
    expect(result.current.existingInvoiceNetOffs[0].bankTransactionId).toBe(
      "txn-1",
    );
  });

  it("calculates currentRemaining using fallback netOffAmount when voucherNetOffs is undefined", () => {
    const invoiceFromTable = {
      id: "inv-1236",
      invoiceNo: "1236",
      totalAmount: "4581821",
      netOffAmount: "4581821",
    };

    const { result } = renderHook(
      () =>
        useVoucherNetoffSelectionLogic({
          open: true,
          onClose: vi.fn(),
          invoice: invoiceFromTable,
          invoiceDirection: "OUT",
        }),
      { wrapper },
    );

    expect(result.current.currentRemaining).toBe(0);
    expect(result.current.resolvedTarget?.netOffAmount).toBe(4581821);
  });

  it("auto-fetches full invoice detail when voucherNetOffs is missing", async () => {
    const invoiceFromTable = {
      id: "inv-1236",
      invoiceNo: "1236",
      totalAmount: "4581821",
      netOffAmount: "4581821",
    };

    (erpInvoicesCoreApi.get as any).mockResolvedValue({
      id: "inv-1236",
      invoiceNo: "1236",
      totalAmount: "4581821",
      voucherNetOffs: [
        {
          id: "v-1",
          bankTransactionId: "txn-1",
          netOffAmount: 4581821,
          bankTransaction: {
            id: "txn-1",
            referenceNumber: "0581AbC8-8AODUJ933",
            bankName: "BIDV",
          },
        },
      ],
    });

    const { result } = renderHook(
      () =>
        useVoucherNetoffSelectionLogic({
          open: true,
          onClose: vi.fn(),
          invoice: invoiceFromTable,
          invoiceDirection: "OUT",
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(erpInvoicesCoreApi.get).toHaveBeenCalledWith("inv-1236");
      expect(result.current.existingInvoiceNetOffs).toHaveLength(1);
    });

    expect(result.current.currentRemaining).toBe(0);
    expect(
      result.current.existingInvoiceNetOffs[0].bankTransaction?.referenceNumber,
    ).toBe("0581AbC8-8AODUJ933");
  });
});
