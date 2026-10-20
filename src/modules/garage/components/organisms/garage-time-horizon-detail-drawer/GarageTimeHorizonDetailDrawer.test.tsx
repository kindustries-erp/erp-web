import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageTimeHorizonDetailDrawer } from "./GarageTimeHorizonDetailDrawer";

// Mock sub-components & hooks
vi.mock("@/modules/garage/hooks/useGarageMonthReceivablesBreakdown", () => ({
  useGarageMonthReceivablesBreakdown: () => ({
    breakdown: {
      month: "criticalOverdue90Plus",
      monthLabel: "Quá hạn >90 ngày",
    },
    trendItem: {
      label: "criticalOverdue90Plus",
      totalBilled: 160728727,
      paid: 157015667,
      receivable: 3726060,
      collectionRate: 97.7,
      cost: 50000000,
      paidCost: 30000000,
      payableCost: 20000000,
      costPaymentRate: 60,
      caseCount: 27,
    },
    summary: {
      totalBilled: 160728727,
      totalPaid: 157015667,
      totalRemaining: 3726060,
      collectionRate: 97.7,
      customer: {
        billed: 100000000,
        paid: 97000000,
        remaining: 3000000,
        rate: 97,
      },
      insurance: {
        billed: 60728727,
        paid: 60015667,
        remaining: 726060,
        rate: 98.8,
      },
      warning: {
        hasVatWithoutInvoice: false,
        totalVatWithoutInvoice: 0,
        casesWithVatNoInvoiceCount: 0,
      },
    },
    insuranceCategorized: {
      all: [],
      withInvoice: [],
      pendingInvoice: [],
      noInvoice: [],
      totals: {
        billed: 0,
        paid: 0,
        remaining: 0,
        caseCount: 0,
        partnerCount: 0,
      },
    },
    enterpriseCategorized: {
      all: [],
      withInvoice: [],
      pendingInvoice: [],
      noInvoice: [],
      totals: {
        billed: 0,
        paid: 0,
        remaining: 0,
        caseCount: 0,
        partnerCount: 0,
      },
    },
    individualCategorized: {
      all: [],
      withInvoice: [],
      pendingInvoice: [],
      noInvoice: [],
      totals: {
        billed: 0,
        paid: 0,
        remaining: 0,
        caseCount: 0,
        partnerCount: 0,
      },
    },
    isLoading: false,
  }),
}));

vi.mock("@/modules/garage/api/garageDebtsAnalyticsApi", () => ({
  garageDebtsAnalyticsApi: {
    getTimeHorizonCases: vi.fn().mockResolvedValue({
      summary: {
        horizon: "criticalOverdue90Plus",
        horizonLabel: "Quá hạn >90 ngày",
        receivableAmount: 3726060,
        receivableTotalAmount: 160728727,
        receivedAmount: 157015667,
        receivableCount: 27,
      },
      items: [],
      total: 27,
      totalPages: 2,
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, def?: string) => def || k,
  }),
}));

describe("GarageTimeHorizonDetailDrawer", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("renders drawer with month-style layout, header, 3 tabs and right panel", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageTimeHorizonDetailDrawer
          open={true}
          horizon="criticalOverdue90Plus"
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    // Title & Badge rate
    expect(screen.getAllByText("Quá hạn >90 ngày").length).toBeGreaterThan(0);
    expect(screen.getByText("97.7% Hoàn tất")).toBeInTheDocument();

    // 3 Tabs
    expect(screen.getByText("Phân loại Nghiệp vụ")).toBeInTheDocument();
    expect(screen.getByText("Phân loại theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("Danh sách vụ việc")).toBeInTheDocument();

    // Right panel
    expect(
      screen.getByText(/Đánh giá rủi ro mốc thời gian/i),
    ).toBeInTheDocument();
  });
});
