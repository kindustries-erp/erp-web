import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableHarness } from "../mocks/V2StandardTable.table-harness";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2Column } from "../V2StandardTable.type";
import { V2TableHeaderRows } from "./V2StandardTable.header";

type Row = { id: string; code: string; qty: number };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "code", accessorKey: "code", header: "Mã", size: 160 },
  { id: "qty", accessorKey: "qty", header: "Số lượng", size: 120 },
];

const columnsByKey = new Map<string, V2Column<Row>>([
  [
    "code",
    {
      key: "code",
      label: "Mã",
      cell: (row) => row.code,
      filter: { valueType: "text" } as V2Column<Row>["filter"],
    },
  ],
  ["qty", { key: "qty", label: "Số lượng", cell: (row) => row.qty }],
]);

/** Trạng thái tối thiểu cho header; các hàm chỉ được gọi khi người dùng thao tác */
const stateStub = {
  query: {
    columnSearch: {},
    columnFilters: {},
    columnOperators: {},
    dateRanges: {},
  },
  getSort: () => undefined,
  setSort: vi.fn(),
  setColumnFilter: vi.fn(),
  setColumnSearch: vi.fn(),
  setColumnOperator: vi.fn(),
  setDateRange: vi.fn(),
  clearColumn: vi.fn(),
} as unknown as V2TableState;

const makeFilters = () =>
  ({
    optionsFor: () => ({ options: [], loading: false }),
    onOpenChange: vi.fn(),
    onOptionsSearchChange: vi.fn(),
  }) as unknown as V2HeaderFilters;

const renderHeader = (
  fetchOptionsFor: () => unknown = () => undefined,
  filters: V2HeaderFilters = makeFilters(),
) =>
  render(
    <TableHarness data={[]} columns={columns}>
      {(table) => (
        <thead>
          <V2TableHeaderRows
            table={table}
            columnsByKey={columnsByKey}
            state={stateStub}
            fetchOptionsFor={fetchOptionsFor}
            filters={filters}
          />
        </thead>
      )}
    </TableHarness>,
  );

describe("V2TableHeaderRows", () => {
  it("renders one header cell per visible column with its label", () => {
    const { container } = renderHeader();
    const headers = container.querySelectorAll("thead th");
    expect(headers.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.getByText("Số lượng")).toBeInTheDocument();
  });

  it("offers a filter button only for columns that can be filtered", () => {
    renderHeader(() => ({ items: [] }));
    expect(
      screen.getByRole("button", { name: "Lọc cột Mã" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Lọc cột Số lượng" }),
    ).not.toBeInTheDocument();
  });

  it("does not render the filter button when options cannot be fetched", () => {
    renderHeader(() => undefined);
    expect(
      screen.queryByRole("button", { name: "Lọc cột Mã" }),
    ).not.toBeInTheDocument();
  });

  it("reports the open request to the filters hook when the button is clicked", () => {
    const filters = makeFilters();
    renderHeader(() => ({ items: [] }), filters);
    fireEvent.click(screen.getByRole("button", { name: "Lọc cột Mã" }));
    expect(filters.onOpenChange).toHaveBeenCalled();
  });
});
