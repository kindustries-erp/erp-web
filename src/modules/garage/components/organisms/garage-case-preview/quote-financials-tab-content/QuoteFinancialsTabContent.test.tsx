import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuoteFinancialsTabContent } from "./QuoteFinancialsTabContent";

vi.mock("@/core/i18n", () => ({
  useT: () => (_k: string, d?: string) => d || _k,
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("../../../organisms/garage-cashflow-form-drawer", () => ({
  GarageCashflowFormDrawer: (props: any) =>
    props.open ? (
      <div data-testid="mock-cashflow-drawer">
        Mock Cashflow Drawer - {props.defaultType} - {props.fixedCaseId}
      </div>
    ) : null,
}));

vi.mock("../components/tables/quote-receivables-table", () => ({
  QuoteReceivablesTable: () => <div data-testid="mock-receivables-table" />,
}));

vi.mock("../components/tables/quote-cost-summary-section", () => ({
  QuoteCostSummarySection: () => <div data-testid="mock-cost-section" />,
}));

describe("QuoteFinancialsTabContent Organism", () => {
  it("renders quick cashflow buttons and opens drawer when clicked", () => {
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

    const thuTienBtn = screen.getByRole("button", { name: /Thu tiền/i });
    expect(thuTienBtn).toBeDefined();

    fireEvent.click(thuTienBtn);
    expect(screen.getByTestId("mock-cashflow-drawer")).toBeDefined();
    expect(
      screen.getByText(/Mock Cashflow Drawer - RECEIPT - case-123/),
    ).toBeDefined();
  });
});
