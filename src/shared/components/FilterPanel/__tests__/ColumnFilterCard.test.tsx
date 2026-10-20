import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ColumnFilterCard } from "../ColumnFilterCard";
import {
  ColumnValueType,
  TableSortState,
} from "@/shared/components/DataTable/types";
import type { ColumnFilterDescriptor } from "@/shared/components/DataTable/createColumnHeaderFilter";
import { getDropdownSearchState } from "@/shared/components/DataTable/TableColumnHeaderFilter";

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("ColumnFilterCard", () => {
  const sampleDescriptor: ColumnFilterDescriptor = {
    key: "partnerName",
    title: "Đối tác",
    titleText: "Đối tác",
    type: ColumnValueType.TEXT,
    filterOptions: [
      { label: "Công ty ABC", value: "Công ty ABC" },
      { label: "Công ty SACN", value: "Công ty SACN" },
    ],
  };

  it("does not call onSearchChange or onFilterChange immediately while typing until Apply is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={true}
        searchValue=""
        onSearchChange={onSearchChange}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
        sortState={TableSortState.NONE}
        onSortChange={onSortChange}
      />,
    );

    // 1. Type in searchbox
    const searchInputs = screen.getAllByPlaceholderText(
      'Từ khóa ("..." hoặc a;b)',
    );
    fireEvent.change(searchInputs[0], { target: { value: "SACN" } });

    // 2. onSearchChange should NOT have been called yet (pending state)
    expect(onSearchChange).not.toHaveBeenCalled();

    // 3. Click Apply button
    const applyButton = screen.getByText("Áp dụng");
    fireEvent.click(applyButton);

    // 4. Now onSearchChange is called with "SACN" and dropdownSearchState is updated
    expect(onSearchChange).toHaveBeenCalledWith("SACN");
    expect(getDropdownSearchState("partnerName")).toBe("SACN");
  });

  it("does not call onFilterChange immediately when checkbox is toggled until Apply is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={true}
        searchValue=""
        onSearchChange={onSearchChange}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
        sortState={TableSortState.NONE}
        onSortChange={onSortChange}
      />,
    );

    // 1. Toggle checkbox for "Công ty SACN"
    const checkbox = screen.getByText("Công ty SACN");
    fireEvent.click(checkbox);

    // 2. onFilterChange should NOT have been called yet
    expect(onFilterChange).not.toHaveBeenCalled();

    // 3. Click Apply
    const applyButton = screen.getByText("Áp dụng");
    fireEvent.click(applyButton);

    // 4. onFilterChange is called with ["Công ty SACN"]
    expect(onFilterChange).toHaveBeenCalledWith(["Công ty SACN"]);
  });

  it("resets all pending and applied filters when Clear Column button is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={true}
        searchValue="SACN"
        onSearchChange={onSearchChange}
        selectedFilters={["Công ty SACN"]}
        onFilterChange={onFilterChange}
        sortState={TableSortState.NONE}
        onSortChange={onSortChange}
      />,
    );

    // 1. Click "Xóa lọc cột"
    const clearBtn = screen.getByText("Xóa lọc cột");
    fireEvent.click(clearBtn);

    // 2. onSearchChange and onFilterChange called with empty values
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith([]);
    expect(getDropdownSearchState("partnerName")).toBe("");
  });

  it("syncs external searchValue changes into pendingSearch when parent updates", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onSortChange = vi.fn();

    const { rerender } = renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={true}
        searchValue=""
        onSearchChange={onSearchChange}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
        sortState={TableSortState.NONE}
        onSortChange={onSortChange}
      />,
    );

    // Rerender with new searchValue coming from Header Apply
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <ColumnFilterCard
          descriptor={sampleDescriptor}
          defaultExpanded={true}
          searchValue="EXTERNAL_SEARCH"
          onSearchChange={onSearchChange}
          selectedFilters={[]}
          onFilterChange={onFilterChange}
          sortState={TableSortState.NONE}
          onSortChange={onSortChange}
        />
      </QueryClientProvider>,
    );

    // Verify search input has updated value
    const searchInput = screen.getByPlaceholderText(
      'Từ khóa ("..." hoặc a;b)',
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("EXTERNAL_SEARCH");
  });

  it("renders 'Tất cả' on badge when in __ALL_MATCHING__ mode and count when regular array", () => {
    const { rerender } = renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={false}
        searchValue='"1";"5"'
        onSearchChange={vi.fn()}
        selectedFilters={["__ALL_MATCHING__", '"1";"5"']}
        onFilterChange={vi.fn()}
        sortState={TableSortState.NONE}
        onSortChange={vi.fn()}
      />,
    );

    // In __ALL_MATCHING__ mode, badge should display "Tất cả" instead of "2"
    expect(screen.getByText("Tất cả")).toBeInTheDocument();

    // Rerender with normal selectedFilters (2 items)
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <ColumnFilterCard
          descriptor={sampleDescriptor}
          defaultExpanded={false}
          searchValue=""
          onSearchChange={vi.fn()}
          selectedFilters={["Công ty ABC", "Công ty SACN"]}
          onFilterChange={vi.fn()}
          sortState={TableSortState.NONE}
          onSortChange={vi.fn()}
        />
      </QueryClientProvider>,
    );

    // With 2 specific selected filters, badge should display "2"
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("syncs new search keywords into __ALL_MATCHING__ filter array when user types more keywords and clicks Apply", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();

    renderWithClient(
      <ColumnFilterCard
        descriptor={sampleDescriptor}
        defaultExpanded={true}
        searchValue='"1";"602"'
        onSearchChange={onSearchChange}
        selectedFilters={["__ALL_MATCHING__", '"1";"602"']}
        onFilterChange={onFilterChange}
        sortState={TableSortState.NONE}
        onSortChange={vi.fn()}
      />,
    );

    // 1. Find text search input
    const searchInputs = screen.getAllByPlaceholderText(
      'Từ khóa ("..." hoặc a;b)',
    );
    fireEvent.change(searchInputs[0], {
      target: { value: '"1";"602";"1066"' },
    });

    // 2. Click Apply button
    const applyButton = screen.getByText("Áp dụng");
    fireEvent.click(applyButton);

    // 3. Both onSearchChange and onFilterChange must receive the new search keywords!
    expect(onSearchChange).toHaveBeenCalledWith('"1";"602";"1066"');
    expect(onFilterChange).toHaveBeenCalledWith([
      "__ALL_MATCHING__",
      '"1";"602";"1066"',
    ]);
  });

  it("formats composite missingSelected with ::: cleanly without exposing ::: in checkbox list", () => {
    const compositeDescriptor: ColumnFilterDescriptor = {
      key: "invoiceNo",
      title: "Số HĐ",
      titleText: "Số HĐ",
      type: ColumnValueType.SELECT,
      filterOptions: [],
    };

    renderWithClient(
      <ColumnFilterCard
        descriptor={compositeDescriptor}
        defaultExpanded={true}
        searchValue=""
        onSearchChange={vi.fn()}
        selectedFilters={["1066:::C25MDP", ":::C25THP"]}
        onFilterChange={vi.fn()}
        sortState={TableSortState.NONE}
        onSortChange={vi.fn()}
      />,
    );

    // Verify cleanly formatted labels in checkbox items instead of raw :::
    expect(screen.getByText("1066 (C25MDP)")).toBeInTheDocument();
    expect(screen.getByText("(C25THP)")).toBeInTheDocument();
  });
});
