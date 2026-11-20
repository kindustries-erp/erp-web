import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewModeCombobox } from "./ViewModeCombobox";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const map: Record<string, string> = {
        viewMode: "Chế độ xem",
        viewModeOverview: "Tổng quan",
        viewModeAudit: "Kiểm toán",
        viewModeCreateNew: "Tạo chế độ xem mới",
        filterStatus: "Trạng thái",
      };
      if (map[key]) return map[key];
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return opts.defaultValue;
      }
      return key;
    },
  }),
}));

describe("ViewModeCombobox (Shared Molecule L2)", () => {
  const mockPresets: TableViewPreset[] = [
    { key: "overview", label: "Tổng quan", filters: {}, isDefault: true },
    {
      key: "financial",
      label: "Tiến độ tài chính",
      filters: {},
      isDefault: true,
    },
    {
      key: "custom_view",
      label: "View Cá Nhân",
      filters: {},
      isDefault: false,
    },
  ];

  it("renders correctly in standard mode without filterGroup", () => {
    render(
      <ViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("Tổng quan");
  });

  it("renders multi-section popover when filterGroup is provided", () => {
    const onSelectFilter = vi.fn();
    const filterGroup = {
      title: "Trạng thái phiếu",
      value: "all",
      onChange: onSelectFilter,
      items: [
        { value: "all", label: "Tất cả" },
        { value: "doing", label: "Đang làm" },
        { value: "done", label: "Kết thúc" },
      ],
    };

    render(
      <ViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
        filterGroup={filterGroup}
      />,
    );

    // Mở popover
    fireEvent.click(screen.getByRole("button"));

    // Hiển thị cả 2 nhóm
    expect(screen.getByText("Trạng thái phiếu")).toBeDefined();
    expect(screen.getByText("Tất cả")).toBeDefined();
    expect(screen.getByText("Đang làm")).toBeDefined();
    expect(screen.getByText("Kết thúc")).toBeDefined();
    expect(screen.getByText("Tiến độ tài chính")).toBeDefined();

    // Click chọn trạng thái "Đang làm"
    fireEvent.click(screen.getByText("Đang làm"));
    expect(onSelectFilter).toHaveBeenCalledWith("doing");
  });

  it("updates compound label on trigger button when filter is active", () => {
    const filterGroup = {
      title: "Trạng thái phiếu",
      value: "doing",
      onChange: vi.fn(),
      items: [
        { value: "all", label: "Tất cả" },
        { value: "doing", label: "Đang làm" },
        { value: "done", label: "Kết thúc" },
      ],
    };

    render(
      <ViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
        filterGroup={filterGroup}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("Tổng quan • Đang làm");
  });

  it("handles preset selection in multi-section mode", () => {
    const onSelectPreset = vi.fn();
    render(
      <ViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={onSelectPreset}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Tiến độ tài chính"));
    expect(onSelectPreset).toHaveBeenCalledWith(mockPresets[1]);
  });
});
