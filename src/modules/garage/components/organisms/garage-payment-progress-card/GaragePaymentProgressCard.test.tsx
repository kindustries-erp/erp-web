import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GaragePaymentProgressCard } from "./GaragePaymentProgressCard";

vi.mock("../../GarageMonthDetailDrawer", () => ({
  GarageMonthDetailDrawer: ({ open }: any) =>
    open ? <div data-testid="month-detail-drawer">Drawer Content</div> : null,
}));

const mockTrendData = [
  {
    label: "2026-07",
    caseCount: 10,
    revenue: 50000000,
    tienCoThue: 55000000,
    totalBilled: 55000000,
    paid: 45000000,
    receivable: 10000000,
    receivableWithInvoice: 8000000,
    receivableNoInvoice: 2000000,
    excludedDebtAmount: 0,
    cost: 30000000,
    paidCost: 25000000,
    payableCost: 5000000,
    payableCostWithInvoice: 4000000,
    payableCostNoInvoice: 1000000,
    excludedDebtCost: 0,
    collectionRate: 81.8,
    costPaymentRate: 83.3,
  },
  {
    label: "2026-08",
    caseCount: 15,
    revenue: 80000000,
    tienCoThue: 88000000,
    totalBilled: 88000000,
    paid: 70000000,
    receivable: 18000000,
    receivableWithInvoice: 15000000,
    receivableNoInvoice: 3000000,
    excludedDebtAmount: 0,
    cost: 50000000,
    paidCost: 40000000,
    payableCost: 10000000,
    payableCostWithInvoice: 8000000,
    payableCostNoInvoice: 2000000,
    excludedDebtCost: 0,
    collectionRate: 79.5,
    costPaymentRate: 80.0,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("GaragePaymentProgressCard Organism (L3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card title and default RECEIPT tab successfully", () => {
    render(
      <GaragePaymentProgressCard
        collectionSummary={
          {
            totalBilled: 143000000,
            totalPaid: 115000000,
            collectionRate: 80.4,
          } as any
        }
        costPaymentSummary={
          {
            totalCost: 80000000,
            totalPaidCost: 65000000,
            paymentRate: 81.25,
          } as any
        }
        trend={mockTrendData as any}
      />,
      { wrapper: createWrapper() },
    );

    expect(
      screen.getByText("Tiến độ Dòng tiền & Công nợ Dịch vụ"),
    ).toBeInTheDocument();
    expect(screen.getByText("Phải Thu")).toBeInTheDocument();
    expect(screen.getByText("Phải Trả")).toBeInTheDocument();
    expect(
      screen.getByText("Tỷ lệ hoàn tất thu tiền dịch vụ"),
    ).toBeInTheDocument();
  });

  it("switches to PAYMENT tab when clicked", () => {
    render(
      <GaragePaymentProgressCard
        collectionSummary={
          {
            totalBilled: 143000000,
            totalPaid: 115000000,
            collectionRate: 80.4,
          } as any
        }
        costPaymentSummary={
          {
            totalCost: 80000000,
            totalPaidCost: 65000000,
            paymentRate: 81.25,
          } as any
        }
        trend={mockTrendData as any}
      />,
      { wrapper: createWrapper() },
    );

    const payableTab = screen.getByText("Phải Trả");
    fireEvent.click(payableTab);

    expect(
      screen.getByText("Tỷ lệ hoàn tất chi trả chi phí / NCC"),
    ).toBeInTheDocument();
  });

  it("renders with self-fetching mode without crashing", () => {
    render(<GaragePaymentProgressCard />, { wrapper: createWrapper() });

    expect(
      screen.getByText("Tiến độ Dòng tiền & Công nợ Dịch vụ"),
    ).toBeInTheDocument();
  });
});
