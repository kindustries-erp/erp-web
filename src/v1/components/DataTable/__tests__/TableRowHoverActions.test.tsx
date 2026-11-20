import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TableRowHoverActions } from "../TableRowHoverActions";

const ITEMS = [
  { label: "Xem chi tiết", onClick: vi.fn() },
  { label: "Xóa", onClick: vi.fn(), variant: "danger" as const },
];

describe("TableRowHoverActions", () => {
  it("does not paint a backdrop blur on the hidden bar, only on hover", () => {
    render(<TableRowHoverActions items={ITEMS} />);
    const pill = screen
      .getByRole("button", { name: "Xem chi tiết" })
      .closest("div.rounded-xl") as HTMLElement;
    expect(pill.style.backdropFilter).toBe("");
    const classes = pill.className.split(" ");
    expect(classes).not.toContain("backdrop-blur-[20px]");
    expect(classes).toContain("group-hover:backdrop-blur-[20px]");
  });

  it("runs a quick action without bubbling to the row", () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <TableRowHoverActions items={ITEMS} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    expect(ITEMS[0].onClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
