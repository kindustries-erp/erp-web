import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { DataTable, type DataTableColumn } from "../DataTable";

/**
 * Property 7: onRowClick callback is invoked with the correct row item
 *
 * For any DataTable rendered with an onRowClick handler and any row in the table,
 * clicking that row shall invoke onRowClick with the exact item object
 * corresponding to that row.
 *
 * **Validates: Requirements 4.3, 4.6**
 */
describe("DataTable - Property 7: onRowClick invoked with correct row item", () => {
  interface TestItem {
    id: string;
    name: string;
  }

  const testItemArb = fc.record({
    id: fc.uuid(),
    name: fc
      .string({ minLength: 1, maxLength: 30 })
      .map((s) => s.replace(/[<>&"'/\n\r\t]/g, "x")),
  });

  // Generate arrays of 1-20 items with unique ids
  const testItemsArb = fc
    .array(testItemArb, { minLength: 1, maxLength: 20 })
    .map((items) =>
      items.map((item, idx) => ({
        ...item,
        id: `${item.id}-${idx}`,
      })),
    );

  const columns: DataTableColumn<TestItem>[] = [
    {
      key: "name",
      header: "Name",
      cell: (item) => item.name,
    },
  ];

  it("invokes onRowClick with the correct item for each clicked row", () => {
    fc.assert(
      fc.property(testItemsArb, (items) => {
        const onRowClick = vi.fn();

        const { container, unmount } = render(
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyLabel="No data"
            onRowClick={onRowClick}
          />,
        );

        // Get all data rows from tbody (skip the header row in thead)
        const tbody = container.querySelector("tbody");
        expect(tbody).not.toBeNull();

        const rows = tbody!.querySelectorAll("tr");
        expect(rows).toHaveLength(items.length);

        // Click each row and verify the callback receives the correct item
        rows.forEach((row, idx) => {
          onRowClick.mockClear();
          fireEvent.click(row);
          expect(onRowClick).toHaveBeenCalledTimes(1);
          expect(onRowClick).toHaveBeenCalledWith(items[idx]);
        });

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
