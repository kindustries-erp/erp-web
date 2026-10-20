import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2ViewModeCombobox } from "./V2ViewModeCombobox";
import { getTriggerLabel, isFilterActive } from "./V2ViewModeCombobox.helper";

const items = [
  { key: "overview", label: "Tổng quan", isSystem: true },
  { key: "mine", label: "Của tôi" },
];

const filterGroup = {
  items: [
    { key: "all", label: "Tất cả" },
    { key: "new", label: "Mới", badgeCount: 4 },
  ],
  activeKey: "all",
  onChange: vi.fn(),
};

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

  it('filter đang lọc: nhãn trigger ghép "view • filter"', () => {
    render(
      <V2ViewModeCombobox
        items={items}
        activeKey="overview"
        onSelect={vi.fn()}
        filterGroup={{ ...filterGroup, activeKey: "new" }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Chế độ xem" }),
    ).toHaveTextContent("Tổng quan • Mới");
  });

  it("chọn mục filter gọi onChange, đóng popup và hiện badge", () => {
    const onChange = vi.fn();
    render(
      <V2ViewModeCombobox
        items={items}
        activeKey="overview"
        onSelect={vi.fn()}
        filterGroup={{ ...filterGroup, onChange }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));
    expect(screen.getByText("4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /Mới/ }));
    expect(onChange).toHaveBeenCalledWith("new");
    expect(
      screen.queryByRole("listbox", { name: "Bộ lọc dữ liệu" }),
    ).toBeNull();
  });

  it("chỉ có filter group thì không hiện mục Chế độ xem", () => {
    render(
      <V2ViewModeCombobox filterGroup={{ ...filterGroup, activeKey: "new" }} />,
    );
    expect(
      screen.getByRole("button", { name: "Bộ lọc dữ liệu" }),
    ).toHaveTextContent("Mới");
    fireEvent.click(screen.getByRole("button", { name: "Bộ lọc dữ liệu" }));
    expect(screen.queryByRole("option", { name: /Tổng quan/ })).toBeNull();
    expect(screen.getByRole("option", { name: /Tất cả/ })).toBeInTheDocument();
  });
});

describe("getTriggerLabel / isFilterActive", () => {
  it("không ghép khi filter là allKey hoặc không có group", () => {
    expect(getTriggerLabel("Tổng quan", filterGroup)).toBe("Tổng quan");
    expect(getTriggerLabel("Tổng quan")).toBe("Tổng quan");
    expect(isFilterActive(filterGroup)).toBe(false);
  });

  it("allKey tùy chỉnh được tôn trọng", () => {
    const group = { ...filterGroup, allKey: "new", activeKey: "new" };
    expect(isFilterActive(group)).toBe(false);
  });
});
