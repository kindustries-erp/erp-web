import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInvoiceDebtsDashboard } from "../hooks/useInvoiceDebtsDashboard";
import { invoiceDashboardApi } from "../api/invoiceDashboardApi";

vi.mock("../api/invoiceDashboardApi", () => ({
  invoiceDashboardApi: {
    getStats: vi.fn(),
    getDebtsAnalytics: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useInvoiceDebtsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches comprehensive debts analytics successfully", async () => {
    const mockAnalytics = {
      summary: {
        totalReceivable: 100000000,
        paidReceivable: 60000000,
        remainingReceivable: 40000000,
        totalPayable: 50000000,
        paidPayable: 30000000,
        remainingPayable: 20000000,
        netBalance: 20000000,
        collectionRate: 60,
        paymentRate: 60,
      },
      agingComparison: [
        {
          bracket: "0_30" as const,
          label: "0-30 ngày",
          receivableAmount: 20000000,
          payableAmount: 10000000,
          netAmount: 10000000,
        },
        {
          bracket: "31_60" as const,
          label: "31-60 ngày",
          receivableAmount: 15000000,
          payableAmount: 5000000,
          netAmount: 10000000,
        },
      ],
      timeHorizons: {
        nextWeekDue: { receivable: 5000000, payable: 2000000, net: 3000000 },
        nextMonthDue: {
          receivable: 20000000,
          payable: 10000000,
          net: 10000000,
        },
        overdue30To90: {
          receivable: 15000000,
          payable: 5000000,
          net: 10000000,
        },
        criticalOverdue90Plus: {
          receivable: 5000000,
          payable: 5000000,
          net: 0,
        },
      },
      cashTrend: [
        {
          label: "2026-01",
          cashIn: 40000000,
          cashOut: 20000000,
          netCash: 20000000,
        },
        {
          label: "2026-02",
          cashIn: 60000000,
          cashOut: 30000000,
          netCash: 30000000,
        },
      ],
      topReceivableCustomers: [
        {
          taxCode: "0101234567",
          partnerName: "Công ty TNHH Khách Hàng ABC",
          totalAmount: 50000000,
          balanceAmount: 25000000,
          overdueAmount: 10000000,
          maxAgingDays: 45,
        },
      ],
      topPayableSuppliers: [
        {
          taxCode: "0309876543",
          partnerName: "Công ty Cổ Phần NCC XYZ",
          totalAmount: 30000000,
          balanceAmount: 15000000,
          overdueAmount: 5000000,
          maxAgingDays: 35,
        },
      ],
    };

    (invoiceDashboardApi.getDebtsAnalytics as any).mockResolvedValue(
      mockAnalytics,
    );

    const { result } = renderHook(() => useInvoiceDebtsDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toEqual(mockAnalytics.summary);
    expect(result.current.timeHorizons).toEqual(mockAnalytics.timeHorizons);
    expect(result.current.agingComparison).toEqual(
      mockAnalytics.agingComparison,
    );
    expect(result.current.cashTrend).toEqual(mockAnalytics.cashTrend);
    expect(result.current.topReceivableCustomers).toEqual(
      mockAnalytics.topReceivableCustomers,
    );
    expect(result.current.topPayableSuppliers).toEqual(
      mockAnalytics.topPayableSuppliers,
    );
  });
});
