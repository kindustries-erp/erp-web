import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DebtRiskIndicator } from "./DebtRiskIndicator";

describe("DebtRiskIndicator", () => {
  it("renders safe risk level correctly", () => {
    render(<DebtRiskIndicator level="safe" />);
    const indicator = screen.getByRole("status");
    expect(indicator).toBeInTheDocument();
    expect(indicator.className).toContain("bg-emerald-500");
  });

  it("renders high risk level with md size", () => {
    render(<DebtRiskIndicator level="high" size="md" />);
    const indicator = screen.getByRole("status");
    expect(indicator.className).toContain("bg-rose-500");
    expect(indicator.className).toContain("w-2.5 h-2.5");
  });
});
