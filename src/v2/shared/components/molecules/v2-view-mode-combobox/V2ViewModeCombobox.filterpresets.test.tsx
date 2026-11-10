import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
  onClear: vi.fn(),
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

  it("nút Tạo bộ lọc mới cùng hàng với tiêu đề nhóm, căn phải", () => {
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={makeSection()}
      />,
    );

    openPopover();
    const row = screen.getByRole("button", {
      name: "Tạo bộ lọc mới",
    }).parentElement;

    expect(row?.className).toContain("justify-between");
    expect(row).toHaveTextContent("Bộ lọc dữ liệu");
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

describe("bộ lọc custom và mục có sẵn: một danh sách, chỉ một mục được chọn", () => {
  // Chỉ xét nhóm "Bộ lọc có sẵn"; nhóm chế độ xem có lựa chọn riêng
  const selectedNames = () =>
    within(screen.getByRole("listbox", { name: "Bộ lọc dữ liệu" }))
      .getAllByRole("option")
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map((o) => o.textContent);

  it("không có custom đang chọn thì chỉ mục có sẵn đang khớp được chọn", () => {
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={makeSection()}
      />,
    );

    openPopover();

    expect(selectedNames()).toEqual(["Tất cả"]);
  });

  it("custom đang chọn thì mục có sẵn không được chọn (đúng một mục)", () => {
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={makeSection({ activeKey: "cf_1" })}
      />,
    );

    openPopover();

    expect(selectedNames()).toEqual(["PO lớn"]);
  });

  it("chọn mục có sẵn khi custom đang chọn: gọi onClear trước onChange", () => {
    const onChange = vi.fn();
    const section = makeSection({ activeKey: "cf_1" });
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={{ ...filterGroup, onChange }}
        customFilters={section}
      />,
    );

    openPopover();
    fireEvent.click(screen.getByRole("option", { name: "Chờ duyệt" }));

    expect(section.onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("pending");
    expect(vi.mocked(section.onClear).mock.invocationCallOrder[0]).toBeLessThan(
      onChange.mock.invocationCallOrder[0],
    );
  });

  it("chọn mục có sẵn khi không có custom đang chọn: không gọi onClear", () => {
    const onChange = vi.fn();
    const section = makeSection();
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={{ ...filterGroup, onChange }}
        customFilters={section}
      />,
    );

    openPopover();
    fireEvent.click(screen.getByRole("option", { name: "Chờ duyệt" }));

    expect(section.onClear).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("pending");
  });

  it("không có khoảng kẻ giữa mục có sẵn và mục custom (một listbox)", () => {
    render(
      <V2ViewModeCombobox
        items={[{ key: "all", label: "Tổng quan" }]}
        activeKey="all"
        filterGroup={filterGroup}
        customFilters={makeSection()}
      />,
    );

    openPopover();
    const listbox = screen.getByRole("listbox", { name: "Bộ lọc dữ liệu" });

    expect(listbox).toContainElement(
      screen.getByRole("option", { name: "PO lớn" }),
    );
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
