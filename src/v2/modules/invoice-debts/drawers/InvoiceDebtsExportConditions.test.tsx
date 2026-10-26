import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvoiceDebtsExportConditions } from "./InvoiceDebtsExportConditions";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: any) =>
      typeof fallback === "object"
        ? fallback.defaultValue || _key
        : fallback || _key,
  }),
}));

describe("InvoiceDebtsExportConditions", () => {
  const defaultProps = {
    exportMode: "by-period" as const,
    onExportModeChange: vi.fn(),
    periodType: "month" as const,
    onPeriodTypeChange: vi.fn(),
    period: "2026-03",
    onPeriodChange: vi.fn(),
    periodOptions: [{ value: "2026-03", label: "Tháng 03/2026" }],
    quarter: "2026-Q1",
    onQuarterChange: vi.fn(),
    quarterOptions: [{ value: "2026-Q1", label: "Quý 1/2026" }],
    dateFrom: "2026-03-01",
    onDateFromChange: vi.fn(),
    dateTo: "2026-03-31",
    onDateToChange: vi.fn(),
    filterSummaryRows: [],
    filterCount: 0,
    starting: false,
    noColumnSelected: false,
    onStart: vi.fn(),
    partnerType: undefined,
    onPartnerTypeChange: vi.fn(),
  };

  it("renders partner tabs including Tất cả, Khách hàng, Nhà cung cấp", () => {
    render(<InvoiceDebtsExportConditions {...defaultProps} />);

    expect(screen.getByText("Tất cả")).toBeDefined();
    expect(screen.getByText("Khách hàng")).toBeDefined();
    expect(screen.getByText("Nhà cung cấp")).toBeDefined();
  });

  it("calls onPartnerTypeChange when clicking a partner tab", () => {
    const onPartnerTypeChange = vi.fn();
    render(
      <InvoiceDebtsExportConditions
        {...defaultProps}
        onPartnerTypeChange={onPartnerTypeChange}
      />,
    );

    fireEvent.click(screen.getByText("Khách hàng"));
    expect(onPartnerTypeChange).toHaveBeenCalledWith("CUSTOMER");

    fireEvent.click(screen.getByText("Tất cả"));
    expect(onPartnerTypeChange).toHaveBeenCalledWith(undefined);
  });

  it("disables export button when noColumnSelected is true", () => {
    render(
      <InvoiceDebtsExportConditions
        {...defaultProps}
        noColumnSelected={true}
      />,
    );

    const button = screen.getByRole("button", { name: /Xuất Excel/i });
    expect(button).toBeDisabled();
  });
});
