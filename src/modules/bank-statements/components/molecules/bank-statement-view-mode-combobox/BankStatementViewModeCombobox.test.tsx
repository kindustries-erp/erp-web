import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BankStatementViewModeCombobox } from "./BankStatementViewModeCombobox";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

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

describe("BankStatementViewModeCombobox (Module Molecule L2)", () => {
  const mockPresets: TableViewPreset[] = [
    { key: "overview", label: "Tổng quan", filters: {}, isDefault: true },
  ];

  it("renders bank statement view mode combobox and handles filterGroup", () => {
    const onFilterChange = vi.fn();
    render(
      <BankStatementViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={vi.fn()}
        onCreateView={vi.fn()}
        onEditView={vi.fn()}
        onDeleteView={vi.fn()}
        filterGroup={{
          title: "Loại giao dịch",
          value: "ALL",
          onChange: onFilterChange,
          items: [
            { value: "ALL", label: "Tất cả" },
            { value: "IN", label: "Thu" },
            { value: "OUT", label: "Chi" },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Loại giao dịch")).toBeDefined();
    expect(screen.getByText("Thu")).toBeDefined();

    fireEvent.click(screen.getByText("Thu"));
    expect(onFilterChange).toHaveBeenCalledWith("IN");
  });
});
