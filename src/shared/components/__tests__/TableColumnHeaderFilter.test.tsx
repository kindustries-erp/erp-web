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

    // 5. Verify: onFilterChange receives ["1187"], onSearchChange receives "" (search keyword is cleared when options selected)
    expect(onFilterChange).toHaveBeenCalledWith(["1187"]);
    expect(onSearchChange).toHaveBeenCalledWith("");
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

  it("automatically hides footer actions when dateRangeSlot is provided and hideFilter is true", () => {
    renderWithClient(
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
        dateRangeSlot={
          <div data-testid="custom-date-slot">
            <button>Slot Apply</button>
          </div>
        }
      />,
    );

    // 1. Open Popover
    fireEvent.click(screen.getByText("Ngày tiếp nhận"));

    // 2. Custom date slot is rendered
    expect(screen.getByTestId("custom-date-slot")).toBeDefined();

    // 3. Footer actions of TableColumnHeaderFilter ("Xóa bộ lọc", "Áp dụng") are NOT rendered
    expect(screen.queryByText("Áp dụng")).toBeNull();
    expect(screen.queryByText("Xóa bộ lọc")).toBeNull();
  });

  it("keeps checked options visible at the top when searchbox is active without resetting them (client mode)", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();

    renderWithClient(
      <TableColumnHeaderFilter
        title="Khách hàng"
        columnKey="customer"
        sortState="none"
        onSortChange={vi.fn()}
        searchValue=""
        onSearchChange={onSearchChange}
        filterOptions={[
          { label: "Alpha Company", value: "ALPHA" },
          { label: "Beta Logistics", value: "BETA" },
          { label: "Gamma Auto", value: "GAMMA" },
        ]}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Mở Popover
    fireEvent.click(screen.getByText("Khách hàng"));

    // 2. Ban đầu tick chọn "Alpha Company"
    const alphaItem = screen.getByText("Alpha Company");
    fireEvent.click(alphaItem);

    // 3. Gõ từ khóa "Beta" vào searchbox
    const searchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    );
    fireEvent.change(searchInput, { target: { value: "Beta" } });

    // 4. Kiểm tra:
    // - "Alpha Company" (đã được tick) VẪN HIỂN THỊ trên danh sách
    // - "Beta Logistics" (khớp từ khóa tìm kiếm) HIỂN THỊ
    // - "Gamma Auto" (không khớp và không được tick) BIẾN MẤT
    expect(screen.getByText("Alpha Company")).toBeDefined();
    expect(screen.getByText("Beta Logistics")).toBeDefined();
    expect(screen.queryByText("Gamma Auto")).toBeNull();

    // 5. Tick thêm "Beta Logistics"
    fireEvent.click(screen.getByText("Beta Logistics"));

    // 6. Bấm Áp dụng
    fireEvent.click(screen.getByText("Áp dụng"));

    // 7. Verify kết quả: nhận cả ["ALPHA", "BETA"] và xóa search text để chống lọc kép
    expect(onFilterChange).toHaveBeenCalledWith(["ALPHA", "BETA"]);
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("preserves checked options when searching with server fetchOptions and retains known labels", async () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const fetchOptionsMock = vi
      .fn()
      .mockImplementation(async ({ search }: { search: string }) => {
        if (search === "VinFast") {
          return {
            items: [
              { label: "VinFast VF8 (29A-12345)", value: "VF8" },
              { label: "VinFast VF9 (30A-67890)", value: "VF9" },
            ],
            total: 2,
            next: null,
          };
        }
        return {
          items: [
            { label: "Toyota Camry (51A-99999)", value: "CAMRY" },
            { label: "Honda CRV (60A-88888)", value: "CRV" },
          ],
          total: 2,
          next: null,
        };
      });

    renderWithClient(
      <TableColumnHeaderFilter
        title="Dòng xe"
        columnKey="carModel"
        sortState="none"
        onSortChange={vi.fn()}
        searchValue=""
        onSearchChange={onSearchChange}
        fetchOptions={fetchOptionsMock}
        selectedFilters={[]}
        onFilterChange={onFilterChange}
      />,
    );

    // 1. Mở Popover
    fireEvent.click(screen.getByText("Dòng xe"));

    // Chờ fetch lần đầu hiển thị Camry
    const camryItem = await screen.findByText("Toyota Camry (51A-99999)");
    expect(camryItem).toBeDefined();

    // 2. Tick chọn Camry
    fireEvent.click(camryItem);

    // 3. Gõ "VinFast" vào searchbox
    const searchInput = screen.getByPlaceholderText(
      'Tìm... ("..." chính xác, ; nhiều từ)',
    );
    fireEvent.change(searchInput, { target: { value: "VinFast" } });

    // 4. Chờ kết quả tìm kiếm VinFast xuất hiện
    const vf8Item = await screen.findByText("VinFast VF8 (29A-12345)");
    expect(vf8Item).toBeDefined();

    // 5. Kiểm tra Toyota Camry VẪN HIỂN THỊ với nhãn đẹp (lấy từ knownLabelsRef)
    expect(screen.getByText("Toyota Camry (51A-99999)")).toBeDefined();

    // 6. Tick thêm VF8
    fireEvent.click(vf8Item);

    // 7. Bấm Áp dụng
    fireEvent.click(screen.getByText("Áp dụng"));

    expect(onFilterChange).toHaveBeenCalledWith(["CAMRY", "VF8"]);
    expect(onSearchChange).toHaveBeenCalledWith("");
  });
});
