import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableHarness } from "../mocks/V2StandardTable.table-harness";
import type { V2Column } from "../V2StandardTable.type";
import { V2TableSummary } from "./V2StandardTable.summary.row";

type Row = { id: string; qty: number; amount: number };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "qty", accessorKey: "qty", header: "SL" },
  { id: "amount", accessorKey: "amount", header: "Thành tiền" },
];

const columnsByKey = new Map<string, V2Column<Row>>([
  ["qty", { key: "qty", label: "SL", cell: (row) => row.qty }],
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

const values = {
  amount: { pageValue: 30, totalValue: 90, cumulativeValue: 30 },
};

describe("V2TableSummary", () => {
  it("renders one footer cell per visible column plus the actions cell", () => {
    const { container } = render(
      <TableHarness data={[]} columns={columns}>
        {(table) => (
          <V2TableSummary
            table={table}
            columnsByKey={columnsByKey}
            values={values}
            page={1}
            totalPages={3}
          />
        )}
      </TableHarness>,
    );
    expect(container.querySelector("tfoot")).toBeInTheDocument();
    expect(container.querySelectorAll("tfoot td")).toHaveLength(3);
  });

  it("leaves the cell empty for a column without a summary", () => {
    const { container } = render(
      <TableHarness data={[]} columns={columns}>
        {(table) => (
          <V2TableSummary
            table={table}
            columnsByKey={columnsByKey}
            values={values}
            page={1}
            totalPages={3}
          />
        )}
      </TableHarness>,
    );
    const firstCell = container.querySelector("tfoot td");
    expect(firstCell).toBeEmptyDOMElement();
  });

  it("applies the glass surface to the summary cells", () => {
    const { container } = render(
      <TableHarness data={[]} columns={columns}>
        {(table) => (
          <V2TableSummary
            table={table}
            columnsByKey={columnsByKey}
            values={values}
            page={1}
            totalPages={3}
          />
        )}
      </TableHarness>,
    );
    container
      .querySelectorAll("tfoot td")
      .forEach((cell) => expect(cell).toHaveClass("backdrop-blur-[16px]"));
  });
});
