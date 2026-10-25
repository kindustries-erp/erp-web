import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VinfastPartsStockExportConditions } from "./VinfastPartsStockExportConditions";
import type { VinfastPartsStockExportConditionsProps } from "./VinfastPartsStockExportConditions";

const baseProps: VinfastPartsStockExportConditionsProps = {
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
  noColumnSelected: false,
};

describe("VinfastPartsStockExportConditions", () => {
  it("calls onStart when the export button is pressed", () => {
    const onStart = vi.fn();
    render(
      <VinfastPartsStockExportConditions {...baseProps} onStart={onStart} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Xuất Excel" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("disables export when no column is selected", () => {
    render(
      <VinfastPartsStockExportConditions {...baseProps} noColumnSelected />,
    );

    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });

  it("shows the filter summary in current-filter mode", () => {
    render(
      <VinfastPartsStockExportConditions
        {...baseProps}
        exportMode="by-current-filter"
        filterSummaryRows={[{ label: "Loại xe", value: "Ô tô" }]}
        filterCount={1}
      />,
    );

    expect(screen.getByText("Loại xe")).toBeInTheDocument();
    expect(screen.queryByText("Từ ngày")).not.toBeInTheDocument();
  });
});
