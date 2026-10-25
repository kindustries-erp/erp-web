import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ExportConditionSection } from "./V2ExportConditionSection";
import type { V2ExportConditionSectionProps } from "./V2ExportConditionSection.type";

const base: V2ExportConditionSectionProps = {
  exportMode: "by-period",
  onExportModeChange: vi.fn(),
  periodType: "month",
  onPeriodTypeChange: vi.fn(),
  period: "2026-10",
  onPeriodChange: vi.fn(),
  periodOptions: [{ value: "2026-10", label: "Tháng 10/2026" }],
  quarter: "2026-Q4",
  onQuarterChange: vi.fn(),
  quarterOptions: [{ value: "2026-Q4", label: "Quý 4/2026" }],
  dateFrom: "2026-10-01",
  onDateFromChange: vi.fn(),
  dateTo: "2026-10-31",
  onDateToChange: vi.fn(),
  starting: false,
  onStart: vi.fn(),
};

describe("V2ExportConditionSection", () => {
  it("shows period fields in by-period mode and switches mode on click", () => {
    const onExportModeChange = vi.fn();
    render(
      <V2ExportConditionSection
        {...base}
        onExportModeChange={onExportModeChange}
      />,
    );

    expect(screen.getByText("Điều kiện xuất dữ liệu")).toBeInTheDocument();
    expect(screen.getByText("Từ ngày")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("radio", { name: /Theo filter hiện tại/ }),
    );
    expect(onExportModeChange).toHaveBeenCalledWith("by-current-filter");
  });

  it("shows the filter summary instead of period fields in by-current-filter mode", () => {
    render(
      <V2ExportConditionSection
        {...base}
        exportMode="by-current-filter"
        filterSummaryRows={[{ label: "Loại xe", value: "Ô tô" }]}
        filterCount={2}
      />,
    );

    expect(screen.queryByText("Từ ngày")).not.toBeInTheDocument();
    expect(screen.getByText("Loại xe")).toBeInTheDocument();
    expect(screen.getByText("2 điều kiện lọc")).toBeInTheDocument();
  });

  it("disables the start button when startDisabled is set", () => {
    render(<V2ExportConditionSection {...base} startDisabled />);
    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });
});
