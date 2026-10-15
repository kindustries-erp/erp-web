import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCustomerDetailDrawer } from "./GarageCustomerDetailDrawer";

vi.mock("./hooks/useGarageCustomerDetailLogic", () => ({
  useGarageCustomerDetailLogic: (props: any) => ({
    completedCases: [],
    inProgressCases: [],
    vehicleDebtStats: [],
    agingDonutItems: [],
    monthlyTrendItems: [],
    totals: {
      totalCases: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalBalance: 0,
      maxAging: 0,
      aging0_30: 0,
      aging31_60: 0,
      aging61_90: 0,
      agingOver90: 0,
      vehicleCount: 0,
      recoveryRate: 0,
      completedCount: 0,
      inProgressCount: 0,
      inProgressAmount: 0,
    },
    activeSubTab: "cases",
    setActiveSubTab: vi.fn(),
    activeDebtType: props?.debtType || "receivables",
    setActiveDebtType: vi.fn(),
    paginatedCompletedCases: [],
    filteredCompletedCases: [],
    page: 1,
    pageSize: 10,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    tableState: {},
    selectedCaseCode: null,
    setSelectedCaseCode: vi.fn(),
    drawerEditMode: false,
    setDrawerEditMode: vi.fn(),
    settlementCase: null,
    setSettlementCase: vi.fn(),
    invoiceLinkingCase: null,
    setInvoiceLinkingCase: vi.fn(),
    refetch: vi.fn(),
    isLoading: false,
  }),
}));

describe("GarageCustomerDetailDrawer", () => {
  it("renders customer drawer when open", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCustomerDetailDrawer
          open={true}
          onClose={vi.fn()}
          customerCode="KH-001"
          customerName="Công ty An Khánh"
        />
      </QueryClientProvider>,
    );

    expect(screen.getAllByText("Công ty An Khánh").length).toBeGreaterThan(0);
  });

  it("renders customer drawer in payables mode", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCustomerDetailDrawer
          open={true}
          onClose={vi.fn()}
          customerCode="KH-001"
          customerName="Công ty An Khánh"
          debtType="payables"
        />
      </QueryClientProvider>,
    );

    expect(screen.getAllByText("Công ty An Khánh").length).toBeGreaterThan(0);
  });
});
