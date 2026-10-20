import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCaseViewModeCombobox } from "./GarageCaseViewModeCombobox";

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

describe("GarageCaseViewModeCombobox (Module Molecule L2)", () => {
  const mockPresets = [
    { key: "overview", label: "Tổng quan", filters: {}, isDefault: true },
  ];

  it("renders garage view mode combobox and handles filter selection", () => {
    const onFilterChange = vi.fn();
    render(
      <GarageCaseViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
        filterGroup={{
          title: "Trạng thái phiếu",
          value: "all",
          onChange: onFilterChange,
          items: [
            { value: "all", label: "Tất cả" },
            { value: "BAO_GIA", label: "Báo giá" },
            { value: "DANG_LAM", label: "Đang làm" },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Trạng thái phiếu")).toBeDefined();
    expect(screen.getByText("Báo giá")).toBeDefined();

    fireEvent.click(screen.getByText("Báo giá"));
    expect(onFilterChange).toHaveBeenCalledWith("BAO_GIA");
  });
});
