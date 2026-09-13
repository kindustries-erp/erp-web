import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { DataTable, type DataTableColumn } from "../DataTable";
import { ActionDropdown, type ActionItem } from "../ActionDropdown";

/**
 * Property 6: ActionDropdown trigger click does not propagate to parent row
 *
 * For any ActionDropdown rendered inside a DataTable row that has an onRowClick
 * handler, clicking the ActionDropdown trigger button shall NOT invoke the
 * onRowClick callback.
 *
 * **Validates: Requirements 6.4**
 */
describe("ActionDropdown - Property 6: trigger click does not propagate to row", () => {
  interface TestItem {
    id: string;
  }

  const actionItemArb = fc.record({
    label: fc
      .string({ minLength: 1, maxLength: 30 })
      .map((s) => s.replace(/[<>&"'/\n\r\t]/g, "x")),
    variant: fc.constantFrom("default" as const, "danger" as const),
  });

  // Generate arrays of 1-5 visible action items
  const actionItemsArb = fc
    .array(actionItemArb, { minLength: 1, maxLength: 5 })
    .map((items) =>
      items.map((item, idx) => ({
        ...item,
        label: `${item.label}-${idx}`,
        onClick: () => {},
        hidden: false,
      })),
    );

  const columns: DataTableColumn<TestItem>[] = [
    {
      key: "name",
      header: "Name",
      cell: () => "Test",
    },
  ];

  it.skip("clicking the ActionDropdown trigger does not invoke onRowClick", async () => {
    fc.assert(
      fc.property(actionItemsArb, (actionItems: ActionItem[]) => {
        const onRowClick = vi.fn();
        const items: TestItem[] = [{ id: "row-1" }];

        const { container, unmount } = render(
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            emptyLabel="No data"
            onRowClick={onRowClick}
            actionsColumn={{
              cell: () => <ActionDropdown items={actionItems} />,
            }}
          />,
        );

        // Find the ActionDropdown trigger button in the rendered table
        const triggerButton = container.querySelector(
          'tbody button[type="button"]',
        );
        expect(triggerButton).not.toBeNull();

        // Click the trigger button
        fireEvent.click(triggerButton!);

        // Assert that onRowClick was NOT called (stopPropagation prevents it)
        expect(onRowClick).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
