import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ExportPeriodFields } from "./V2ExportPeriodFields";

const props = {
  periodType: "custom" as const,
  onPeriodTypeChange: vi.fn(),
  period: "",
  onPeriodChange: vi.fn(),
  periodOptions: [],
  quarter: "",
  onQuarterChange: vi.fn(),
  quarterOptions: [],
  dateFrom: "2026-10-01",
  onDateFromChange: vi.fn(),
  dateTo: "2026-10-31",
  onDateToChange: vi.fn(),
};

describe("V2ExportPeriodFields", () => {
  it("keeps only one date picker open at a time", () => {
    render(<V2ExportPeriodFields {...props} />);

    const [fromTrigger, toTrigger] = screen.getAllByRole("button", {
      name: "dd/mm/yyyy",
    });

    fireEvent.click(fromTrigger);
    expect(fromTrigger).toHaveAttribute("aria-expanded", "true");
    expect(toTrigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toTrigger);
    expect(toTrigger).toHaveAttribute("aria-expanded", "true");
    expect(fromTrigger).toHaveAttribute("aria-expanded", "false");
  });
});
