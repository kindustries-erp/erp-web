import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageViewModeCombobox } from "./GarageViewModeCombobox";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const map: Record<string, string> = {
        viewMode: "Chế độ xem",
        viewModeOverview: "Tổng quan",
      };
      if (map[key]) return map[key];
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return opts.defaultValue;
      }
      return key;
    },
  }),
}));

describe("GarageViewModeCombobox (Module Molecule L2)", () => {
  const mockPresets = [
    { key: "overview", label: "Tổng quan", filters: {}, isDefault: true },
    { key: "all_columns", label: "Đầy đủ", filters: {}, isDefault: false },
  ];

  it("renders garage view mode combobox and handles filter selection", () => {
    const onFilterChange = vi.fn();
    render(
      <GarageViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
        filterGroup={{
          title: "Trạng thái nợ",
          value: "ALL",
          onChange: onFilterChange,
          items: [
            { value: "ALL", label: "Tất cả" },
            { value: "HAS_DEBT", label: "Còn nợ" },
            { value: "0-30", label: "0 - 30 ngày" },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Trạng thái nợ")).toBeDefined();
    expect(screen.getByText("Còn nợ")).toBeDefined();

    fireEvent.click(screen.getByText("Còn nợ"));
    expect(onFilterChange).toHaveBeenCalledWith("HAS_DEBT");
  });
});
