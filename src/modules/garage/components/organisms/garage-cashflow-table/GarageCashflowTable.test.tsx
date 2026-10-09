import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowTable } from "./GarageCashflowTable";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hook
vi.mock("./GarageCashflowTable.hook", () => ({
  useGarageCashflowTable: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("GarageCashflowTable", () => {
  it("renders correctly without crashing", () => {
    (useGarageCashflowTable as any).mockReturnValue({
      data: [],
      total: 0,
      totalPages: 0,
      isLoading: false,
      page: 1,
      setPage: vi.fn(),
      pageSize: 20,
      setPageSize: vi.fn(),
      sorts: [],
      setSort: vi.fn(),
      columnFilters: {},
      setColumnFilter: vi.fn(),
      columnSearch: {},
      setColumnSearch: vi.fn(),
      activeFilterCount: 0,
      clearAllFilters: vi.fn(),
      refetch: vi.fn(),
      getColumnOptions: vi.fn(),
      createMutation: { mutate: vi.fn(), isPending: false },
      updateMutation: { mutate: vi.fn(), isPending: false },
      deleteMutation: { mutate: vi.fn(), isPending: false },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowTable
          tabs={[{ value: "all", label: "Tất cả" }]}
          activeTab="all"
          onTabChange={vi.fn()}
          onCreate={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Thu chi xưởng")).toBeInTheDocument();
    expect(screen.getByText("Tạo phiếu mới")).toBeInTheDocument();
  });
});
