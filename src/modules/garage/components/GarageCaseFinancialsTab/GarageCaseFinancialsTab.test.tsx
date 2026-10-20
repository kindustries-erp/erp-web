import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseFinancialsTab } from "./GarageCaseFinancialsTab";

vi.mock("./context/GarageCaseFinancialsContext", () => ({
  useGarageCaseFinancials: () => ({
    caseData: {
      id: "case-123",
      soChungTu: "GR-PDV-2026-001",
      rawData: {},
    },
    detailTxnId: null,
    viewInvoiceId: null,
    previewPdf: null,
    setDetailTxnId: vi.fn(),
    setViewInvoiceId: vi.fn(),
    setPreviewPdf: vi.fn(),
  }),
}));

vi.mock(
  "../organisms/garage-case-preview/quote-financials-tab-content",
  () => ({
    QuoteFinancialsTabContent: ({ caseId }: { caseId: string }) => (
      <div data-testid="quote-financials-tab-content">
        Quote Financials Content: {caseId}
      </div>
    ),
  }),
);

describe("GarageCaseFinancialsTab", () => {
  it("renders QuoteFinancialsTabContent without the old domain switcher or bottom invoice tables", () => {
    render(<GarageCaseFinancialsTab caseId="case-123" />);

    expect(
      screen.getByTestId("quote-financials-tab-content"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Quote Financials Content: case-123/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/PHẢI THU \(BÁN RA\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PHẢI CHI \(MUA VÀO\)/i)).not.toBeInTheDocument();
  });
});
