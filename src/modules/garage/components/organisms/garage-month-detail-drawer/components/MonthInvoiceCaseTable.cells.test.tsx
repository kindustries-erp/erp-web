import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CasePayerTypeBadge,
  CaseInvoiceStatusBadge,
} from "./MonthInvoiceCaseTable.cells";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";

describe("MonthInvoiceCaseTable.cells", () => {
  const baseRow: MonthInvoiceCaseRow = {
    id: "test-row-1",
    caseId: "case-1",
    soChungTu: "GR-PDV2610-0001",
    bienSoXe: "51K-123.45",
    khachHangName: "Khách lẻ A",
    partnerTitle: "Khách lẻ A",
    payerType: "KH",
    hasInvoice: false,
    invoiceNos: [],
    hasVat: false,
    vatAmount: 0,
    vatWarning: false,
    billed: 1000000,
    paid: 0,
    remaining: 1000000,
    shareRate: 10,
  };

  it("renders 'Không VAT' badge when case has no invoice and no VAT warning", () => {
    render(<CaseInvoiceStatusBadge row={baseRow} />);
    expect(screen.getByText("Không VAT")).toBeInTheDocument();
  });

  it("renders 'Có VAT – Chưa xuất HĐ' when vatWarning is true", () => {
    const vatWarnRow = { ...baseRow, vatWarning: true };
    render(<CaseInvoiceStatusBadge row={vatWarnRow} />);
    expect(screen.getByText("Có VAT – Chưa xuất HĐ")).toBeInTheDocument();
  });

  it("renders invoice numbers when hasInvoice is true", () => {
    const invoiceRow = {
      ...baseRow,
      hasInvoice: true,
      invoiceNos: ["001234"],
    };
    render(<CaseInvoiceStatusBadge row={invoiceRow} />);
    expect(screen.getByText("✓ #001234")).toBeInTheDocument();
  });

  it("renders Thu BH and Thu KH badges correctly", () => {
    const { rerender } = render(<CasePayerTypeBadge payerType="BH" />);
    expect(screen.getByText("Thu BH")).toBeInTheDocument();

    rerender(<CasePayerTypeBadge payerType="KH" />);
    expect(screen.getByText("Thu KH")).toBeInTheDocument();
  });
});
