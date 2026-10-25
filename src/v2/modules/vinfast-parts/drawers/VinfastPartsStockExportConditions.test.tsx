import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VinfastPartsStockExportConditions } from "./VinfastPartsStockExportConditions";

const baseProps = {
  period: "all",
  periodOptions: [{ value: "all", label: "Tất cả thời gian" }],
  onPeriodChange: vi.fn(),
  dateRange: {},
  onDateRangeChange: vi.fn(),
  starting: false,
  disabled: false,
  onStart: vi.fn(),
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
    render(<VinfastPartsStockExportConditions {...baseProps} disabled />);

    expect(screen.getByRole("button", { name: "Xuất Excel" })).toBeDisabled();
  });
});
