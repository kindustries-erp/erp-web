import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableHarness } from "../mocks/V2StandardTable.table-harness";
import { V2TableSkeletonRows } from "./V2TableSkeletonRows";

type Row = { id: string; code: string };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "__selection", header: "" },
  { id: "__index", header: "#" },
  { id: "code", accessorKey: "code", header: "Mã" },
];

describe("V2TableSkeletonRows", () => {
  it("renders one bar per visible column except the selection column", () => {
    render(
      <TableHarness data={[]} columns={columns}>
        {(table) => (
          <tbody>
            <V2TableSkeletonRows
              table={table}
              loadingLabel="Đang tải..."
              count={2}
            />
          </tbody>
        )}
      </TableHarness>,
    );
    // 2 dòng × (cột STT + cột mã); cột chọn không có thanh
    expect(screen.getAllByTestId("v2-table-skeleton-bar")).toHaveLength(4);
  });

  it("exposes the loading label only once, in the first cell", () => {
    render(
      <TableHarness data={[]} columns={columns}>
        {(table) => (
          <tbody>
            <V2TableSkeletonRows
              table={table}
              loadingLabel="Đang tải..."
              count={3}
            />
          </tbody>
        )}
      </TableHarness>,
    );
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});
