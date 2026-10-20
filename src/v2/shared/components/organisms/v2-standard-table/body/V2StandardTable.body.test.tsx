import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableHarness } from "../mocks/V2StandardTable.table-harness";
import type { V2Column } from "../V2StandardTable.type";
import { V2TableBodyRows } from "./V2StandardTable.body";

type Row = { id: string; code: string };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "code", accessorKey: "code", header: "Mã" },
];

const columnsByKey = new Map<string, V2Column<Row>>([
  ["code", { key: "code", label: "Mã", cell: (row) => row.code }],
]);

const renderBody = (data: Row[], overrides: { loading?: boolean } = {}) =>
  render(
    <TableHarness data={data} columns={columns}>
      {(table) => (
        <V2TableBodyRows
          table={table}
          layoutKey="layout"
          columnsByKey={columnsByKey}
          colSpan={2}
          loading={overrides.loading ?? false}
          emptyLabel="Không có dữ liệu"
          loadingLabel="Đang tải dữ liệu..."
          menuRowKey={null}
          onRowContextMenu={vi.fn()}
        />
      )}
    </TableHarness>,
  );

describe("V2TableBodyRows", () => {
  it("renders the data rows with their cells", () => {
    renderBody([{ id: "1", code: "HD-001" }]);
    expect(screen.getByText("HD-001")).toBeInTheDocument();
  });

  it("shows the empty label when there are no rows and no loading", () => {
    renderBody([]);
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows skeleton bars instead of the empty label while loading with no rows", () => {
    renderBody([], { loading: true });
    expect(screen.getAllByTestId("v2-table-skeleton-bar")).toHaveLength(5);
    expect(screen.queryByText("Không có dữ liệu")).not.toBeInTheDocument();
  });

  it("keeps the existing rows dimmed instead of skeleton while reloading", () => {
    const { container } = renderBody([{ id: "1", code: "HD-001" }], {
      loading: true,
    });
    expect(screen.queryAllByTestId("v2-table-skeleton-bar")).toHaveLength(0);
    expect(container.querySelector("tbody")).toHaveClass("opacity-60");
  });
});
