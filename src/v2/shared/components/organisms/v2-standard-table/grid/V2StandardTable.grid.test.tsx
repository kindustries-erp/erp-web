import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableHarness } from "../mocks/V2StandardTable.table-harness";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2Column } from "../V2StandardTable.type";
import { V2TableGrid } from "./V2StandardTable.grid";

type Row = { id: string; code: string; amount: number };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "code", accessorKey: "code", header: "Mã", size: 160 },
  { id: "amount", accessorKey: "amount", header: "Thành tiền", size: 140 },
];

const columnsByKey = new Map<string, V2Column<Row>>([
  ["code", { key: "code", label: "Mã", cell: (row) => row.code }],
  [
    "amount",
    {
      key: "amount",
      label: "Thành tiền",
      cell: (row) => row.amount,
      summary: { variant: "amount" },
    },
  ],
]);

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

const filtersStub = {
  optionsFor: () => undefined,
  onOpenChange: vi.fn(),
  onOptionsSearchChange: vi.fn(),
} as unknown as V2HeaderFilters;

const renderGrid = (
  data: Row[],
  extra: {
    summary?: Parameters<typeof V2TableGrid>[0]["summary"];
    loading?: boolean;
  } = {},
) =>
  render(
    <TableHarness data={data} columns={columns} wrapInTable={false}>
      {(table) => (
        <V2TableGrid
          table={table}
          columnsByKey={columnsByKey}
          state={stateStub}
          fetchOptionsFor={() => undefined}
          filters={filtersStub}
          layoutKey="layout"
          loading={extra.loading ?? false}
          emptyLabel="Không có dữ liệu"
          loadingLabel="Đang tải dữ liệu..."
          menuRowKey={null}
          onRowContextMenu={vi.fn()}
          summary={extra.summary}
        />
      )}
    </TableHarness>,
  );

describe("V2TableGrid", () => {
  it("renders the header labels and the data rows inside one table", () => {
    const { container } = renderGrid([
      { id: "1", code: "HD-001", amount: 500 },
    ]);
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.getByText("HD-001")).toBeInTheDocument();
  });

  it("shows the empty label when there are no rows", () => {
    renderGrid([]);
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("renders the summary footer only when a summary is passed", () => {
    const { container, unmount } = renderGrid([
      { id: "1", code: "HD-001", amount: 500 },
    ]);
    expect(container.querySelector("tfoot")).not.toBeInTheDocument();
    unmount();

    const withSummary = renderGrid([{ id: "1", code: "HD-001", amount: 500 }], {
      summary: {
        values: {
          amount: { pageValue: 500, totalValue: 500, cumulativeValue: 500 },
        },
        page: 1,
        totalPages: 1,
      },
    });
    expect(withSummary.container.querySelector("tfoot")).toBeInTheDocument();
  });

  it("shows skeleton bars while loading with no rows", () => {
    renderGrid([], { loading: true });
    expect(
      screen.getAllByTestId("v2-table-skeleton-bar").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Không có dữ liệu")).not.toBeInTheDocument();
  });
});
