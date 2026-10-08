import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2ViewModeCombobox } from "./V2ViewModeCombobox";

const items = [
  { key: "overview", label: "Tổng quan", isSystem: true },
  { key: "mine", label: "Của tôi" },
];

describe("V2ViewModeCombobox", () => {
  it("hiện nhãn preset đang chọn", () => {
    render(
      <V2ViewModeCombobox items={items} activeKey="mine" onSelect={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Của tôi");
  });

  it("chọn preset gọi onSelect và đóng popup", () => {
    const onSelect = vi.fn();
    render(
      <V2ViewModeCombobox
        items={items}
        activeKey="overview"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    fireEvent.click(screen.getByRole("option", { name: /Của tôi/ }));
    expect(onSelect).toHaveBeenCalledWith("mine");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("sửa/xóa chỉ cho preset không phải hệ thống; có nút tạo mới", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onCreate = vi.fn();
    render(
      <V2ViewModeCombobox
        items={items}
        activeKey="overview"
        onSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreate={onCreate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    expect(
      screen.getAllByRole("button", { name: "Sửa chế độ xem" }),
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Sửa chế độ xem" }));
    expect(onEdit).toHaveBeenCalledWith("mine");
    fireEvent.click(screen.getByRole("button", { name: "Xóa chế độ xem" }));
    expect(onDelete).toHaveBeenCalledWith("mine");
    fireEvent.click(screen.getByRole("button", { name: "Tạo chế độ xem" }));
    expect(onCreate).toHaveBeenCalled();
  });
});
