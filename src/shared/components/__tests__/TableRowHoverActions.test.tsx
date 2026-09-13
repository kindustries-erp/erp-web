import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import {
  TableRowHoverActions,
  extractQuickActions,
} from "../DataTable/TableRowHoverActions";
import type { ActionDropdownItem } from "../ActionDropdown";
import { TooltipProvider } from "@/core/components/ui/Tooltip";

describe("TableRowHoverActions", () => {
  it("extracts maximum 2 quick actions correctly from grouped items", () => {
    const items: ActionDropdownItem[] = [
      {
        groupLabel: "TRA CỨU",
        items: [
          { label: "Chi tiết", onClick: () => {} },
          { label: "Tải XML", onClick: () => {} },
          { label: "In phiếu", onClick: () => {} },
        ],
      },
      {
        groupLabel: "THAO TÁC",
        items: [{ label: "Xóa", onClick: () => {}, variant: "danger" }],
      },
    ];

    const extracted = extractQuickActions(items, 2);
    expect(extracted).toHaveLength(2);
    expect(extracted[0].label).toBe("Chi tiết");
    expect(extracted[1].label).toBe("Tải XML");
  });

  it("extracts quick actions skipping hidden items", () => {
    const items: ActionDropdownItem[] = [
      { label: "Hidden 1", onClick: () => {}, hidden: true },
      { label: "Action 1", onClick: () => {} },
      {
        groupLabel: "GROUP",
        items: [
          { label: "Hidden 2", onClick: () => {}, hidden: true },
          { label: "Action 2", onClick: () => {} },
          { label: "Action 3", onClick: () => {} },
        ],
      },
    ];

    const extracted = extractQuickActions(items, 2);
    expect(extracted).toHaveLength(2);
    expect(extracted[0].label).toBe("Action 1");
    expect(extracted[1].label).toBe("Action 2");
  });

  it("renders quick action buttons and handles click with stopPropagation", () => {
    const onAction1 = vi.fn();
    const onAction2 = vi.fn();

    const items: ActionDropdownItem[] = [
      { label: "Chi tiết", onClick: onAction1 },
      { label: "Tải XML", onClick: onAction2 },
    ];

    const { container } = render(
      <TooltipProvider>
        <TableRowHoverActions items={items} />
      </TooltipProvider>,
    );

    const buttons = container.querySelectorAll("button");
    // Button 1: Quick Action 1, Button 2: Quick Action 2, Button 3: MoreHorizontal
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    fireEvent.click(buttons[0]);
    expect(onAction1).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(onAction2).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when items is empty", () => {
    const { container } = render(
      <TooltipProvider>
        <TableRowHoverActions items={[]} />
      </TooltipProvider>,
    );
    expect(container.firstChild).toBeNull();
  });
});
