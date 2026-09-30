import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceViewModeCombobox } from "../components/InvoiceViewModeCombobox";
import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: string) => {
      const map: Record<string, string> = {
        viewMode: "Chế độ xem",
        viewModeOverview: "Tổng quan",
        viewModeAudit: "Kiểm toán / Đối soát",
        viewModeCreateNew: "Tạo view mới...",
        viewModeEdit: "Chỉnh sửa view",
        viewModeDelete: "Xóa view",
        viewModeDeleteTitle: "Xóa chế độ xem",
      };
      return map[key] || defaultVal || key;
    },
  }),
}));

describe("InvoiceViewModeCombobox", () => {
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
      key: "custom_1",
      label: "View Tùy Chỉnh 1",
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
      <InvoiceViewModeCombobox
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
    expect(screen.getByText("View Tùy Chỉnh 1")).toBeInTheDocument();
    expect(screen.getByText("Tạo view mới...")).toBeInTheDocument();
  });

  it("renders Edit (Pencil) buttons for both default and custom presets, but Delete (Trash) only for custom", () => {
    const onSelect = vi.fn();
    const onCreateView = vi.fn();
    const onEditView = vi.fn();
    const onDeleteView = vi.fn();

    render(
      <InvoiceViewModeCombobox
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
    expect(editButtons).toHaveLength(3); // overview, audit, and custom_1

    const deleteButtons = screen.getAllByTitle("Xóa view");
    expect(deleteButtons).toHaveLength(1); // only custom_1
  });

  it("triggers onEditView when edit button is clicked on a default preset", () => {
    const onSelect = vi.fn();
    const onCreateView = vi.fn();
    const onEditView = vi.fn();
    const onDeleteView = vi.fn();

    render(
      <InvoiceViewModeCombobox
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
