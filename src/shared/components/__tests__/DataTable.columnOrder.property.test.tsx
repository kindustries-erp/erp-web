import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
import { DataTable, type DataTableColumn } from "../DataTable";

/**
 * Property 2: Column order is preserved when no actionsColumn prop is provided
 *
 * For any DataTable rendered without an actionsColumn prop and any array of
 * columns, the rendered column order shall exactly match the order of entries
 * in the columns array.
 *
 * **Validates: Requirements 1.3**
 */
describe("DataTable - Property 2: Column order preserved without actionsColumn", () => {
  type Item = { id: string };

  // Generate a column with a unique key and unique header text
  const columnArb = (index: number): fc.Arbitrary<DataTableColumn<Item>> =>
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => s.replace(/[^a-zA-Z0-9]/g, "a"))
      .map((base) => ({
        key: `col-${index}-${base}`,
        header: `Header-${index}-${base}`,
        cell: () => `Cell-${index}`,
      }));

  // Generate an array of 1-20 columns with unique keys and headers
  const columnsArb = fc
    .integer({ min: 1, max: 20 })
    .chain((count) =>
      fc.tuple(...Array.from({ length: count }, (_, i) => columnArb(i))),
    );

  it("renders columns in the exact order provided in the columns array", () => {
    fc.assert(
      fc.property(columnsArb, (columns) => {
        const items: Item[] = [{ id: "row-1" }];

        const { container, unmount } = render(
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyLabel="No data"
          />,
        );

        // Query all <th> elements in the header row
        const thElements = container.querySelectorAll("thead th");

        // Assert the number of rendered columns matches input
        expect(thElements).toHaveLength(columns.length);

        // Assert the text content of each <th> matches the corresponding column header in order
        columns.forEach((col, idx) => {
          expect(thElements[idx]).toHaveTextContent(String(col.header));
        });

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
