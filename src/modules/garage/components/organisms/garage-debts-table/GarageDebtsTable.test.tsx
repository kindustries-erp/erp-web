import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDebtsTable } from "./GarageDebtsTable";

vi.mock("@/modules/garage/hooks/useGarageCustomersList", () => ({
  useGarageCustomersList: () => ({
    data: [],
    isLoading: false,
    sorts: [],
    setSort: vi.fn(),
    columnFilters: {},
    setColumnFilter: vi.fn(),
    columnSearch: {},
    setColumnSearch: vi.fn(),
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    refetch: vi.fn(),
    summary: {},
    activeFilterCount: 0,
    clearAllFilters: vi.fn(),
  }),
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
});
