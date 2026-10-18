import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDebtsTable } from "./GarageDebtsTable";

const mockHookData = {
  data: [
    {
      licensePlate: "51A-999.88",
      customerCode: "KH00123",
      customerName: "Công ty Vận Tải XYZ",
      branchExternalId: "BRANCH_01",
      caseCount: 2,
      totalAmount: 10000000,
      paidAmount: 5000000,
      balanceAmount: 5000000,
      latestDate: "2026-09-20T10:00:00Z",
      oldestDate: "2026-09-15T10:00:00Z",
      maxAgingDays: 5,
      aging0_30: 5000000,
      aging31_60: 0,
      aging61_90: 0,
      agingOver90: 0,
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
    totalRevenue: 10000000,
    totalPaid: 5000000,
    totalBalance: 5000000,
    totalAging0_30: 5000000,
    totalAging31_60: 0,
    totalAging61_90: 0,
    totalAgingOver90: 0,
  },
  activeFilterCount: 0,
  clearAllFilters: vi.fn(),
};

vi.mock("@/modules/garage/hooks/useGarageCustomersList", () => ({
  useGarageCustomersList: () => mockHookData,
}));

vi.mock("@/modules/garage/hooks/useGarage", () => ({
  useGarageBranches: () => ({ data: [] }),
}));

describe("GarageDebtsTable", () => {
  it("renders table header and title", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebtsTable
          onOpenCustomerDetail={vi.fn()}
          onOpenExportDrawer={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Công nợ garage")).toBeInTheDocument();
  });

  it("renders licensePlate column and customer column with data", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebtsTable
          onOpenCustomerDetail={vi.fn()}
          onOpenExportDrawer={vi.fn()}
        />
      </QueryClientProvider>,
    );

    // Verify column headers exist
    expect(screen.getByText("Biển số xe")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();

    // Verify row data renders license plate and customer info
    expect(screen.getByText("51A-999.88")).toBeInTheDocument();
    expect(screen.getByText("Công ty Vận Tải XYZ")).toBeInTheDocument();
    expect(screen.getByText("KH00123")).toBeInTheDocument();
  });
});
