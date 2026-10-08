import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuoteFinancialsTabContent } from "./QuoteFinancialsTabContent";

vi.mock("@/core/i18n", () => ({
  useT: () => (_k: string, d?: string) => d || _k,
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("../components/tables/quote-receivables-table", () => ({
  QuoteReceivablesTable: () => <div data-testid="mock-receivables-table" />,
}));

vi.mock("../components/tables/quote-cost-summary-section", () => ({
  QuoteCostSummarySection: () => <div data-testid="mock-cost-section" />,
}));

describe("QuoteFinancialsTabContent Organism", () => {
  it("renders receivables and cost sections properly", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <QuoteFinancialsTabContent
          caseId="case-123"
          caseCode="GR-PDV-2026-001"
          caseData={{ conLai: 1500000 }}
          editMode={true}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("mock-receivables-table")).toBeDefined();
    expect(screen.getByTestId("mock-cost-section")).toBeDefined();
  });
});
