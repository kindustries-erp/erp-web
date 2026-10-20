import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TableColumnHeaderFilter } from "../TableColumnHeaderFilter";
import { operationalApi } from "@/modules/operational/api/operationalApi";

vi.mock("@/modules/operational/api/operationalApi", () => ({
  operationalApi: {
    getInventoryStockColumnOptions: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, d?: string) => d || k,
  }),
}));

describe("TableColumnHeaderFilter Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("does NOT call operationalApi or fetchOptions when hideFilter is true (e.g. date columns)", async () => {
    const fetchOptionsMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TableColumnHeaderFilter
          title="Ngày tiếp nhận"
          columnKey="caseDate"
          sortState="none"
          onSortChange={vi.fn()}
          searchValue=""
          onSearchChange={vi.fn()}
          selectedFilters={[]}
          onFilterChange={vi.fn()}
          hideFilter={true}
          hideFooter={true}
          fetchOptions={fetchOptionsMock}
          dateRangeSlot={({ close }) => (
            <div data-testid="date-slot">
              <span>Date Range Picker</span>
              <button onClick={close}>Close</button>
            </div>
          )}
        />
      </QueryClientProvider>,
    );

    // Click trigger to open popover
    const trigger = screen.getByText("Ngày tiếp nhận");
    fireEvent.click(trigger);

    // dateRangeSlot is rendered
    expect(screen.getByTestId("date-slot")).toBeDefined();
    expect(screen.getByText("Date Range Picker")).toBeDefined();

    // Verification: Neither fetchOptions nor operationalApi was called
    expect(fetchOptionsMock).not.toHaveBeenCalled();
    expect(
      operationalApi.getInventoryStockColumnOptions,
    ).not.toHaveBeenCalled();
  });

  it("does NOT call operationalApi fallback when fetchOptions is omitted and queryKeyPrefix is not inventory-stock", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TableColumnHeaderFilter
          title="Custom Column"
          columnKey="customCol"
          queryKeyPrefix="custom-module-prefix"
          sortState="none"
          onSortChange={vi.fn()}
          searchValue=""
          onSearchChange={vi.fn()}
          selectedFilters={[]}
          onFilterChange={vi.fn()}
          hideFilter={true}
        />
      </QueryClientProvider>,
    );

    const trigger = screen.getByText("Custom Column");
    fireEvent.click(trigger);

    expect(
      operationalApi.getInventoryStockColumnOptions,
    ).not.toHaveBeenCalled();
  });
});
