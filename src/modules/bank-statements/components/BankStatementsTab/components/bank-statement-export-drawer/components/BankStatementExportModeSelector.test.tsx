import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BankStatementExportModeSelector } from "./BankStatementExportModeSelector";

vi.mock("@/core/i18n", () => ({
  useT: () => (_key: string, fallback?: string) => fallback || _key,
}));

describe("BankStatementExportModeSelector", () => {
  it("renders both options and uses sr-only radio inputs to prevent native browser blue accent", () => {
    const handleChange = vi.fn();
    render(
      <BankStatementExportModeSelector
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
      <BankStatementExportModeSelector
        exportMode="by-period"
        onChange={handleChange}
      />,
    );

    const option2 = screen.getByText("Theo filter hiện tại");
    fireEvent.click(option2);
    expect(handleChange).toHaveBeenCalledWith("by-current-filter");
  });
});
