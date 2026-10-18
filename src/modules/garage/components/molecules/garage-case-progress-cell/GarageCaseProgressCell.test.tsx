import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseProgressCell } from "./GarageCaseProgressCell";

describe("GarageCaseProgressCell Molecule (Pro Data 2 Rows)", () => {
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

  it("renders receivable row 1 with paid label, amount & badge % and row 2 with total", () => {
    const { container } = render(
      <GarageCaseProgressCell
        type="receivable"
        total={1000000}
        paid={400000}
        balance={600000}
      />,
    );
    // Row 1: Paid label, amount and percentage badge
    expect(screen.getByText("Đã thu:")).toBeDefined();
    expect(screen.getByText("400.000 ₫")).toBeDefined();
    expect(screen.getByText("40%")).toBeDefined();

    // Row 2: Total label and amount
    expect(screen.getByText("Tổng:")).toBeDefined();
    expect(screen.getByText("1.000.000 ₫")).toBeDefined();

    // Confirm no old progress bar element
    expect(container.querySelector(".rounded-full.h-1\\.5")).toBeNull();
  });

  it("renders payable row 1 with 'Đã trả:', 100% badge and emerald color when fully paid", () => {
    const { container } = render(
      <GarageCaseProgressCell
        type="payable"
        total={500000}
        paid={500000}
        balance={0}
      />,
    );
    expect(screen.getByText("Đã trả:")).toBeDefined();
    expect(screen.getAllByText("500.000 ₫").length).toBe(2); // Row 1 paid & Row 2 total
    expect(screen.getByText("100%")).toBeDefined();
    expect(
      container.querySelector(".text-emerald-600, .dark\\:text-emerald-400"),
    ).toBeDefined();
  });

  it("renders unpaid (0%) gracefully with micro labels", () => {
    render(
      <GarageCaseProgressCell
        type="receivable"
        total={2000000}
        paid={0}
        balance={2000000}
      />,
    );
    expect(screen.getByText("Đã thu:")).toBeDefined();
    expect(screen.getByText("0 ₫")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText("Tổng:")).toBeDefined();
    expect(screen.getByText("2.000.000 ₫")).toBeDefined();
  });
});
