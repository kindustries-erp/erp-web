import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { GarageCashflowKpiCards } from "./GarageCashflowKpiCards";

describe("GarageCashflowKpiCards (L3 Organism)", () => {
  const mockKpi = {
    totalIn: 50000000,
    totalOut: 20000000,
    net: 30000000,
    countIn: 15,
    countOut: 5,
    pendingOutAmount: 2000000,
    pendingOutCount: 1,
  };

  it("renders KPI cards with correct formatted values", () => {
    render(<GarageCashflowKpiCards kpi={mockKpi} />);

    expect(screen.getByText("Tiền vào (Thu)")).toBeInTheDocument();
    expect(screen.getByText("Tiền ra (Chi)")).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền ròng")).toBeInTheDocument();
    expect(screen.getByText("Chi chờ duyệt")).toBeInTheDocument();
  });
});
