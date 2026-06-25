import { describe, it, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { DataTable, type DataTableColumn } from "../DataTable";

/**
 * Property 1: Actions column is always last when actionsColumn prop is provided
 *
 * For any DataTable rendered with an `actionsColumn` prop and any non-empty array
 * of `columns`, the last rendered column in the DOM shall always be the actions
 * column (identified by internal id `__actions`), regardless of the number or order
 * of columns in the `columns` array.
 *
 * **Validates: Requirements 1.1**
 */

interface TestItem {
  id: string;
}

const ACTIONS_HEADER_TEXT = "__ACTIONS_HEADER__";

describe("DataTable - Property 1: Actions column is always last when actionsColumn provided", () => {
  it("should always render the actions column as the last column", () => {
    fc.assert(
      fc.property(
        fc
          .array(
            fc
              .string({ minLength: 1, maxLength: 20 })
              .filter((s) => s !== "__actions" && s !== "actions"),
            { minLength: 1, maxLength: 20 },
          )
          .chain((keys): fc.Arbitrary<string[]> => {
            // Ensure unique keys
            const uniqueKeys = [...new Set(keys)];
            if (uniqueKeys.length === 0) {
              return fc.constant(["col_fallback"] as string[]);
            }
            return fc.constant(uniqueKeys);
          }),
        (columnKeys: string[]) => {
          const columns: DataTableColumn<TestItem>[] = columnKeys.map(
            (key) => ({
              key,
              header: `Header-${key}`,
              cell: (item: TestItem) => item.id,
            }),
          );

          const { container } = render(
            <DataTable<TestItem>
              items={[{ id: "test-item-1" }]}
              columns={columns}
              getRowKey={(item) => item.id}
              emptyLabel="No data"
              actionsColumn={{
                cell: () => <span>ACTIONS</span>,
                header: <span>{ACTIONS_HEADER_TEXT}</span>,
              }}
            />,
          );

          // Get all header cells in the first header row, excluding the structural spacer column
          const headerCells = Array.from(
            container.querySelectorAll("thead tr th"),
          ).filter((th) => !th.classList.contains("w-auto"));
          expect(headerCells.length).toBeGreaterThan(0);

          // The last header cell should contain the actions header text
          const lastHeaderCell = headerCells[headerCells.length - 1];
          expect(lastHeaderCell.textContent).toBe(ACTIONS_HEADER_TEXT);

          // Also verify via data rows: last cell in data row should be the actions cell
          const dataRows = container.querySelectorAll("tbody tr");
          if (dataRows.length > 0) {
            const cells = Array.from(dataRows[0].querySelectorAll("td")).filter(
              (td) => !td.classList.contains("w-auto"),
            );
            const lastDataCell = cells[cells.length - 1];
            expect(lastDataCell.textContent).toBe("ACTIONS");
          }

          // Total columns should be columnKeys.length + 1 (for actions)
          expect(headerCells.length).toBe(columnKeys.length + 1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
