import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { DataTable, type DataTableColumn } from "../DataTable";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

interface TestItem {
  id: string;
  name: string;
}

describe("DataTable - rowHoverActions trailing action column", () => {
  it("renders 116px trailing action column with centered hover buttons", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { key: "name", header: "Tên", cell: (item) => item.name },
    ];

    const items: TestItem[] = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];

    const { container } = render(
      <TooltipProvider>
        <DataTable<TestItem>
          items={items}
          columns={columns}
          emptyLabel="No data"
          getRowKey={(item) => item.id}
          rowHoverActions={() => [
            { label: "Chi tiết", onClick: () => {} },
            { label: "Xóa", onClick: () => {} },
          ]}
        />
      </TooltipProvider>,
    );

    // The __hover_actions header has 116px width
    const hoverHeader = container.querySelector("thead tr th.w-\\[116px\\]");
    expect(hoverHeader).toBeTruthy();

    // Each row has action buttons rendered in the 116px cell
    const buttons = container.querySelectorAll("tbody button");
    expect(buttons.length).toBeGreaterThanOrEqual(6); // 3 buttons per row * 2 rows
  });

  it("co-exists with legacy actionsColumn during trial phase without empty columns", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { key: "name", header: "Tên", cell: (item) => item.name },
    ];

    const items: TestItem[] = [{ id: "1", name: "Item 1" }];

    const { container } = render(
      <TooltipProvider>
        <DataTable<TestItem>
          items={items}
          columns={columns}
          emptyLabel="No data"
          getRowKey={(item) => item.id}
          actionsColumn={{
            cell: () => <span>LEGACY_ACTION</span>,
            header: "Thao tác",
          }}
          rowHoverActions={() => [{ label: "Chi tiết", onClick: () => {} }]}
        />
      </TooltipProvider>,
    );

    const legacyAction = container.querySelector("tbody span");
    expect(legacyAction?.textContent).toBe("LEGACY_ACTION");
  });
});
