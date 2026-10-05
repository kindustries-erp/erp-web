import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DebtHorizonBadge } from "./DebtHorizonBadge";

describe("DebtHorizonBadge", () => {
  it("renders badge with default slate styling and label", () => {
    render(<DebtHorizonBadge label="T+7" />);
    const badge = screen.getByText("T+7");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-slate-100");
  });

  it("renders badge with rose variant for overdue debts", () => {
    render(<DebtHorizonBadge label="> 90 ngày" variant="rose" />);
    const badge = screen.getByText("> 90 ngày");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-rose-100");
  });
});
