import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CashflowKpiBadge } from "./CashflowKpiBadge";

describe("CashflowKpiBadge (L1 Atom)", () => {
  it("renders label properly", () => {
    render(<CashflowKpiBadge label="+12.5%" variant="emerald" />);
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });

  it("applies variant styling", () => {
    const { container } = render(
      <CashflowKpiBadge label="Chờ duyệt" variant="amber" />,
    );
    expect(container.firstChild).toHaveClass("bg-amber-50");
  });
});
