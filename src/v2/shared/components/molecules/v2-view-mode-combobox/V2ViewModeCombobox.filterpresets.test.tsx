import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ViewModeCombobox } from "./V2ViewModeCombobox";
import { getTriggerLabel } from "./V2ViewModeCombobox.helper";
import type { V2CustomFilterSection } from "./V2ViewModeCombobox.type";

const filterGroup = {
  items: [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
  ],
  activeKey: "all",
  onChange: vi.fn(),
};

const makeSection = (
  overrides: Partial<V2CustomFilterSection> = {},
): V2CustomFilterSection => ({
  items: [{ key: "cf_1", label: "PO lớn" }],
  activeKey: undefined,
  canCreate: true,
  onSelect: vi.fn(),
  onCreate: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  ...overrides,
});

const openPopover = () =>
  fireEvent.click(screen.getByRole("button", { name: "Chế độ xem" }));

describe("V2ViewModeCombobox: bộ lọc tùy chỉnh", () => {
  it("nút Tạo bộ lọc mới nằm trong nhóm bộ lọc và gọi onCreate", () => {
    const section = makeSection();
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={section}
      />,
    );

    openPopover();
    fireEvent.click(screen.getByRole("button", { name: "Tạo bộ lọc mới" }));

    expect(section.onCreate).toHaveBeenCalledTimes(1);
  });

  it("chọn bộ lọc đã lưu gọi onSelect với key", () => {
    const section = makeSection();
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={section}
      />,
    );

    openPopover();
    fireEvent.click(screen.getByRole("option", { name: "PO lớn" }));

    expect(section.onSelect).toHaveBeenCalledWith("cf_1");
  });

  it("nút tạo bị khóa khi đã đủ giới hạn", () => {
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={makeSection({ canCreate: false })}
      />,
    );

    openPopover();

    expect(
      screen.getByRole("button", { name: "Tạo bộ lọc mới" }),
    ).toBeDisabled();
  });

  it("sửa và xóa bộ lọc đã lưu", () => {
    const section = makeSection();
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={section}
      />,
    );

    openPopover();
    fireEvent.click(screen.getByRole("button", { name: "Sửa bộ lọc" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));

    expect(section.onEdit).toHaveBeenCalledWith("cf_1");
    expect(section.onDelete).toHaveBeenCalledWith("cf_1");
  });
});

describe("getTriggerLabel với bộ lọc tùy chỉnh", () => {
  it("dùng tên bộ lọc tùy chỉnh thay cho nhãn bộ lọc hệ thống", () => {
    expect(
      getTriggerLabel(
        "Tổng quan",
        { ...filterGroup, activeKey: "pending" },
        "PO lớn",
      ),
    ).toBe("Tổng quan • PO lớn");
  });

  it("không có bộ lọc tùy chỉnh thì giữ hành vi cũ", () => {
    expect(getTriggerLabel("Tổng quan", filterGroup)).toBe("Tổng quan");
  });
});
