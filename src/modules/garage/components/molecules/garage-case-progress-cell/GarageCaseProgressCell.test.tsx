import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseProgressCell } from "./GarageCaseProgressCell";

describe("GarageCaseProgressCell Molecule", () => {
  it("renders dash placeholder when all amounts are 0", () => {
    const { container } = render(
      <GarageCaseProgressCell
        type="receivable"
        total={0}
        paid={0}
        balance={0}
      />,
    );
    expect(container.textContent).toContain("—");
  });

  it("renders receivable total and progress bar when partially paid", () => {
    render(
      <GarageCaseProgressCell
        type="receivable"
        total={1000000}
        paid={400000}
        balance={600000}
      />,
    );
    expect(screen.getByText("1.000.000 ₫")).toBeDefined();
  });

  it("renders payable total and progress bar when fully paid", () => {
    render(
      <GarageCaseProgressCell
        type="payable"
        total={500000}
        paid={500000}
        balance={0}
      />,
    );
    expect(screen.getByText("500.000 ₫")).toBeDefined();
  });
});
