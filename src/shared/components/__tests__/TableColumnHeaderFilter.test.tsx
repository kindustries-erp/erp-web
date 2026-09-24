import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TableColumnHeaderFilter } from "../DataTable/TableColumnHeaderFilter";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, defaultVal: string) => defaultVal || _key,
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("TableColumnHeaderFilter", () => {
  it("only calls onFilterChange and clears search when multi-select options are selected", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <TableColumnHeaderFilter
        title="Số hóa đơn"
        columnKey="invoiceNo"
        sortState="none"
        onSortChange={onSortChange}
        searchValue=""
        onSearchChange={onSearchChange}
        filterOptions={[
          { label: "1187", value: "1187" },
          { label: "1188", value: "1188" },
        ]}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Open Popover
    const trigger = screen.getByText("Số hóa đơn");
    fireEvent.click(trigger);

    // 2. Search for 1187 in the local search input
    const searchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    );
    fireEvent.change(searchInput, { target: { value: "1187" } });

    // 3. Check the checkbox for 1187
    const checkbox1187 = screen.getByText("1187");
    fireEvent.click(checkbox1187);

    // 4. Click Apply
    const applyButton = screen.getByText("Áp dụng");
    fireEvent.click(applyButton);

    // 5. Verify: onFilterChange receives ["1187"], onSearchChange receives "1187" (search keyword is preserved)
    expect(onFilterChange).toHaveBeenCalledWith(["1187"]);
    expect(onSearchChange).toHaveBeenCalledWith("1187");
  });

  it("calls onSearchChange when no checkboxes are selected but search keyword is typed", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <TableColumnHeaderFilter
        title="Số hóa đơn"
        columnKey="invoiceNo"
        sortState="none"
        onSortChange={onSortChange}
        searchValue=""
        onSearchChange={onSearchChange}
        filterOptions={[
          { label: "1187", value: "1187" },
          { label: "1188", value: "1188" },
        ]}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Open Popover
    const trigger = screen.getByText("Số hóa đơn");
    fireEvent.click(trigger);

    // 2. Type keyword without selecting checkboxes
    const searchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    );
    fireEvent.change(searchInput, { target: { value: "HD-2026" } });

    // 3. Click Apply
    const applyButton = screen.getByText("Áp dụng");
    fireEvent.click(applyButton);

    // 4. Verify: onSearchChange receives "HD-2026", onFilterChange receives []
    expect(onSearchChange).toHaveBeenCalledWith("HD-2026");
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });

  it("resets both search and filters when clear filter button is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <TableColumnHeaderFilter
        title="Số hóa đơn"
        columnKey="invoiceNo"
        sortState="none"
        onSortChange={onSortChange}
        searchValue="1187"
        onSearchChange={onSearchChange}
        filterOptions={[
          { label: "1187", value: "1187" },
          { label: "1188", value: "1188" },
        ]}
        selectedFilters={["1187"]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Open Popover
    const trigger = screen.getByText("Số hóa đơn");
    fireEvent.click(trigger);

    // 2. Click Clear filter
    const clearButton = screen.getByText("Xóa bộ lọc");
    fireEvent.click(clearButton);

    // 3. Verify
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });

  it("persists search keyword in searchbox when popover is reopened", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    const { rerender } = renderWithClient(
      <TableColumnHeaderFilter
        title="Số hóa đơn"
        columnKey="invoiceNo"
        sortState="none"
        onSortChange={onSortChange}
        searchValue=""
        onSearchChange={onSearchChange}
        filterOptions={[
          { label: "1187", value: "1187" },
          { label: "1188", value: "1188" },
        ]}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Open Popover
    fireEvent.click(screen.getByText("Số hóa đơn"));

    // 2. Type "1187" and click Apply
    const searchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    );
    fireEvent.change(searchInput, { target: { value: "1187" } });
    fireEvent.click(screen.getByText("1187"));
    fireEvent.click(screen.getByText("Áp dụng"));

    // 3. Rerender with updated parent props (searchValue="1187", selectedFilters=["1187"])
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <TableColumnHeaderFilter
          title="Số hóa đơn"
          columnKey="invoiceNo"
          sortState="none"
          onSortChange={onSortChange}
          searchValue="1187"
          onSearchChange={onSearchChange}
          filterOptions={[
            { label: "1187", value: "1187" },
            { label: "1188", value: "1188" },
          ]}
          selectedFilters={["1187"]}
          onFilterChange={onFilterChange}
        />
      </QueryClientProvider>,
    );

    // 4. Reopen Popover
    fireEvent.click(screen.getByText("Số hóa đơn"));

    // 5. Verify the search input value is still "1187"
    const reopenedSearchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    ) as HTMLInputElement;
    expect(reopenedSearchInput.value).toBe("1187");
  });
});
