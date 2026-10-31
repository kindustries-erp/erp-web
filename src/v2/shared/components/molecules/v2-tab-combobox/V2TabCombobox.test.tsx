import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { V2TabCombobox } from "./V2TabCombobox";
import type { V2TabComboboxItem } from "./V2TabCombobox.type";

const mockItems: V2TabComboboxItem[] = [
  { value: "overview", label: "Tổng quan", badgeCount: 5 },
  { value: "cases", label: "Hoạt động garage" },
  { value: "services", label: "Bảng kê phụ tùng & công", disabled: true },
];

describe("V2TabCombobox", () => {
  it("renders trigger with active tab label and badge", () => {
    render(<V2TabCombobox items={mockItems} activeKey="overview" />);

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders first item label if activeKey is not matched", () => {
    render(<V2TabCombobox items={mockItems} activeKey="non-existent" />);

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
  });

  it("opens popover and lists all items when clicked", async () => {
    const user = userEvent.setup();
    render(<V2TabCombobox items={mockItems} activeKey="overview" />);

    const trigger = screen.getByRole("button", { name: /Chế độ xem/i });
    await user.click(trigger);

    expect(screen.getByText("Hoạt động garage")).toBeInTheDocument();
    expect(screen.getByText("Bảng kê phụ tùng & công")).toBeInTheDocument();
  });

  it("calls onSelect with item key when an enabled item is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <V2TabCombobox
        items={mockItems}
        activeKey="overview"
        onSelect={handleSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Chế độ xem/i });
    await user.click(trigger);

    const targetItem = screen.getByText("Hoạt động garage");
    await user.click(targetItem);

    expect(handleSelect).toHaveBeenCalledWith("cases");
  });

  it("does not call onSelect when a disabled item is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <V2TabCombobox
        items={mockItems}
        activeKey="overview"
        onSelect={handleSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Chế độ xem/i });
    await user.click(trigger);

    const disabledItem = screen.getByText("Bảng kê phụ tùng & công");
    await user.click(disabledItem);

    expect(handleSelect).not.toHaveBeenCalled();
  });
});
