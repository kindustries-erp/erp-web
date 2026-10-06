import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuoteDocumentCostSummary } from "./QuoteDocumentCostSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

describe("QuoteDocumentCostSummary", () => {
  it("renders 3 cost tiers and total correctly", () => {
    render(
      <QuoteDocumentCostSummary
        costBreakdown={{
          inventoryPartCost: 550000,
          outsourceCost: 150000,
          commissionCost: 50000,
          totalCost: 750000,
        }}
        grossProfit={250000}
        grossMargin={25}
      />,
    );

    expect(screen.getByText("550.000")).toBeInTheDocument();
    expect(screen.getByText("150.000")).toBeInTheDocument();
    expect(screen.getByText("50.000")).toBeInTheDocument();
    expect(screen.getByText("750.000")).toBeInTheDocument();
  });

  it("returns null when all costs are zero", () => {
    const { container } = render(
      <QuoteDocumentCostSummary
        costBreakdown={{
          inventoryPartCost: 0,
          outsourceCost: 0,
          commissionCost: 0,
          totalCost: 0,
        }}
        partsTotalCost={0}
        totalCost={0}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
