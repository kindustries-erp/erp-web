import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BankStatementViewModeCombobox } from "../components/BankStatementViewModeCombobox";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: any) => {
      const map: Record<string, string> = {
        viewMode: "Chế độ xem",
        viewModeOverview: "Tổng quan",
        viewModeAudit: "Kiểm toán / Đối soát",
        viewModeCreateNew: "Tạo chế độ xem mới",
        viewModeEdit: "Chỉnh sửa view",
        viewModeDelete: "Xóa view",
        viewModeDeleteTitle: "Xóa chế độ xem",
      };
      if (map[key]) return map[key];
      if (typeof defaultVal === "object" && defaultVal?.defaultValue) {
        return defaultVal.defaultValue;
      }
      return typeof defaultVal === "string" ? defaultVal : key;
    },
  }),
}));

describe("BankStatementViewModeCombobox", () => {
  const mockPresets: TableViewPreset[] = [
    {
      key: "overview",
      label: "Tổng quan",
      filters: {},
      isDefault: true,
      isCustom: false,
    },
    {
      key: "audit",
      label: "Kiểm toán / Đối soát",
      filters: {},
      isDefault: true,
      isCustom: false,
    },
    {
      key: "custom_bank_1",
      label: "View Kế Toán Quỹ",
      filters: {},
      isDefault: false,
      isCustom: true,
    },
  ];

  it("renders active preset name and opens popover on click", () => {
    const onSelect = vi.fn();
    const onCreateView = vi.fn();
    const onEditView = vi.fn();
    const onDeleteView = vi.fn();

    render(
      <BankStatementViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={onSelect}
        onCreateView={onCreateView}
        onEditView={onEditView}
        onDeleteView={onDeleteView}
      />,
    );

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();

    // Click trigger to open dropdown
    fireEvent.click(screen.getByRole("button", { name: /tổng quan/i }));

    expect(screen.getByText("Kiểm toán / Đối soát")).toBeInTheDocument();
    expect(screen.getByText("View Kế Toán Quỹ")).toBeInTheDocument();
    expect(screen.getByText("Tạo chế độ xem mới")).toBeInTheDocument();
  });

  it("renders Edit buttons for all presets and Delete button only for custom preset", () => {
    const onSelect = vi.fn();
    const onCreateView = vi.fn();
    const onEditView = vi.fn();
    const onDeleteView = vi.fn();

    render(
      <BankStatementViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={onSelect}
        onCreateView={onCreateView}
        onEditView={onEditView}
        onDeleteView={onDeleteView}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /tổng quan/i }));

    const editButtons = screen.getAllByTitle("Chỉnh sửa view");
    expect(editButtons).toHaveLength(3); // overview, audit, and custom_bank_1

    const deleteButtons = screen.getAllByTitle("Xóa view");
    expect(deleteButtons).toHaveLength(1); // only custom_bank_1
  });

  it("triggers onEditView when edit button is clicked on overview preset", () => {
    const onSelect = vi.fn();
    const onCreateView = vi.fn();
    const onEditView = vi.fn();
    const onDeleteView = vi.fn();

    render(
      <BankStatementViewModeCombobox
        presets={mockPresets}
        activePresetKey="overview"
        onSelect={onSelect}
        onCreateView={onCreateView}
        onEditView={onEditView}
        onDeleteView={onDeleteView}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /tổng quan/i }));

    const editButtons = screen.getAllByTitle("Chỉnh sửa view");
    fireEvent.click(editButtons[0]); // Edit "overview"

    expect(onEditView).toHaveBeenCalledWith(
      expect.objectContaining({ key: "overview" }),
    );
  });
});
