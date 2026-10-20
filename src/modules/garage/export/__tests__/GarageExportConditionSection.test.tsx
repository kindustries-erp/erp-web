import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GarageExportConditionSection } from "../GarageExportConditionSection";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : key,
  }),
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, options, placeholder }: any) => (
    <select
      aria-label={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/export-jobs", () => ({
  ExportModeSelector: ({ mode, allowCurrentFilter }: any) => (
    <div
      data-testid="mode"
      data-mode={mode}
      data-allow={String(allowCurrentFilter)}
    />
  ),
  ExportPeriodPicker: () => <div data-testid="period-picker" />,
}));

vi.mock("../GarageExportFilterPreview", () => ({
  GarageExportFilterPreview: () => <div data-testid="filter-preview" />,
}));

const baseProps = {
  targetLabel: "Loại báo cáo",
  targetValue: "a",
  targetOptions: [
    { value: "a", label: "Loại A" },
    { value: "b", label: "Loại B" },
  ],
  onTargetChange: vi.fn(),
  exportMode: "by-period" as const,
  onExportModeChange: vi.fn(),
  modeLabels: {} as any,
  allowCurrentFilter: false,
  period: {} as any,
  periodLabels: {} as any,
  filterSummary: { filterCount: 0 },
  starting: false,
  onStartExport: vi.fn(),
  radioName: "testMode",
};

describe("GarageExportConditionSection", () => {
  it("một section 'Điều kiện xuất dữ liệu' gồm ô chọn, kỳ, ghi chú, trường riêng và nút Xuất", () => {
    render(
      <GarageExportConditionSection
        {...baseProps}
        targetHint="Mô tả loại A"
        baselineNote="Ghi chú kỳ"
      >
        <div data-testid="extra">Trường riêng</div>
      </GarageExportConditionSection>,
    );

    expect(screen.getAllByText("Điều kiện xuất dữ liệu")).toHaveLength(1);
    expect(screen.getByLabelText("Loại báo cáo")).toBeDefined();
    expect(screen.getByText("Mô tả loại A")).toBeDefined();
    expect(screen.getByTestId("period-picker")).toBeDefined();
    expect(screen.getByText("Ghi chú kỳ")).toBeDefined();
    expect(screen.getByTestId("extra")).toBeDefined();
    expect(screen.getByText("Xuất Excel")).toBeDefined();
  });

  it("đổi loại và bấm Xuất gọi đúng callback", () => {
    const onTargetChange = vi.fn();
    const onStartExport = vi.fn();
    render(
      <GarageExportConditionSection
        {...baseProps}
        onTargetChange={onTargetChange}
        onStartExport={onStartExport}
      />,
    );

    fireEvent.change(screen.getByLabelText("Loại báo cáo"), {
      target: { value: "b" },
    });
    expect(onTargetChange).toHaveBeenCalledWith("b");
    fireEvent.click(screen.getByText("Xuất Excel"));
    expect(onStartExport).toHaveBeenCalledTimes(1);
  });

  it("chế độ theo filter: hiện tóm tắt filter, ẩn bộ chọn kỳ và ghi chú kỳ", () => {
    render(
      <GarageExportConditionSection
        {...baseProps}
        exportMode="by-current-filter"
        allowCurrentFilter
        baselineNote="Ghi chú kỳ"
      />,
    );
    expect(screen.getByTestId("filter-preview")).toBeDefined();
    expect(screen.queryByTestId("period-picker")).toBeNull();
    expect(screen.queryByText("Ghi chú kỳ")).toBeNull();
  });

  it("đang xuất: nút bị khóa và đổi nhãn", () => {
    render(<GarageExportConditionSection {...baseProps} starting />);
    const button = screen.getByText("Đang khởi tạo...").closest("button")!;
    expect(button.disabled).toBe(true);
  });
});
