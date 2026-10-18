import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomRadioIndicator } from "./CustomRadioIndicator";
import { InvoiceExportModeSelector } from "./InvoiceExportModeSelector";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

describe("CustomRadioIndicator", () => {
  it("renders unchecked state with neutral border and no inner dot", () => {
    render(<CustomRadioIndicator checked={false} />);
    const indicator = screen.getByTestId("custom-radio-indicator");
    expect(indicator).toHaveAttribute("data-state", "unchecked");
    expect(indicator.querySelector(".rounded-full.bg-background")).toBeNull();
  });

  it("renders checked state with foreground background and inner dot", () => {
    render(<CustomRadioIndicator checked={true} />);
    const indicator = screen.getByTestId("custom-radio-indicator");
    expect(indicator).toHaveAttribute("data-state", "checked");
    expect(
      indicator.querySelector(".rounded-full.bg-background"),
    ).not.toBeNull();
  });
});

describe("InvoiceExportModeSelector", () => {
  it("renders both options and uses sr-only radio inputs to prevent native browser blue accent", () => {
    const handleChange = vi.fn();
    render(
      <InvoiceExportModeSelector
        exportMode="by-period"
        onChange={handleChange}
      />,
    );

    const inputs = screen.getAllByRole("radio");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveClass("sr-only");
    expect(inputs[1]).toHaveClass("sr-only");
    expect(inputs[0]).toBeChecked();
    expect(inputs[1]).not.toBeChecked();
  });

  it("calls onChange when clicking on the second option", () => {
    const handleChange = vi.fn();
    render(
      <InvoiceExportModeSelector
        exportMode="by-period"
        onChange={handleChange}
      />,
    );

    const option2 = screen.getByText("Theo filter hiện tại");
    fireEvent.click(option2);
    expect(handleChange).toHaveBeenCalledWith("by-current-filter");
  });
});
