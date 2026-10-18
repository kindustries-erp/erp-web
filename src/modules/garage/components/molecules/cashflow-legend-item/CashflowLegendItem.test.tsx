import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CashflowLegendItem } from "./CashflowLegendItem";

describe("CashflowLegendItem (L2 Molecule)", () => {
  it("renders color and label correctly", () => {
    render(<CashflowLegendItem color="#059669" label="Tiền vào (Thu)" />);
    expect(screen.getByText("Tiền vào (Thu)")).toBeInTheDocument();
  });
});
