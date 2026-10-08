import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GaragePayablesTable } from "./GaragePayablesTable";

vi.mock("@/modules/garage/hooks/useGarageSuppliersList", () => ({
  useGarageSuppliersList: () => ({
    data: [
      {
        id: "GR-KHA-000107",
        customerCode: "GR-KHA-000107",
        customerName: "CÔNG TY TNHH PHÁT TRIỂN",
        caseCount: 2,
        vehicleCount: 1,
        costAmount: 4000000,
        paidAmount: 0,
        balanceAmount: 4000000,
        maxAgingDays: 15,
        aging0_30: 4000000,
        aging31_60: 0,
        aging61_90: 0,
        agingOver90: 0,
        soPhieu: "GR-KHA-000107",
        caseId: "GR-KHA-000107",
      },
    ],
    isLoading: false,
    sorts: [],
    setSort: vi.fn(),
    columnFilters: {},
    setColumnFilter: vi.fn(),
    columnSearch: {},
    setColumnSearch: vi.fn(),
    page: 1,
    pageSize: 20,
    total: 1,
    totalPages: 1,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    refetch: vi.fn(),
    summary: {
      totalCustomers: 1,
      totalCases: 2,
      totalCost: 4000000,
      totalPaid: 0,
      totalBalance: 4000000,
      totalAging0_30: 4000000,
      totalAging31_60: 0,
      totalAging61_90: 0,
      totalAgingOver90: 0,
    },
    activeFilterCount: 0,
    clearAllFilters: vi.fn(),
  }),
}));

describe("GaragePayablesTable", () => {
  it("renders payables table title and customer cost row", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GaragePayablesTable
          onOpenCustomerDetail={vi.fn()}
          onOpenSupplierDetail={vi.fn()}
          onOpenExportDrawer={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Công nợ phải trả/i)).toBeInTheDocument();
    expect(screen.getByText("CÔNG TY TNHH PHÁT TRIỂN")).toBeInTheDocument();
    expect(screen.getByText("GR-KHA-000107")).toBeInTheDocument();
  });
});
