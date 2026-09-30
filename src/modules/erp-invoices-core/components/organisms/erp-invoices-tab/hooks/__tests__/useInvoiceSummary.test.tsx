import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useInvoiceSummary } from "../useInvoiceSummary";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

function SummaryTestComponent({
  invoices,
  totals,
  page,
  pageSize,
  totalCount,
  totalPages,
}: {
  invoices: ErpInvoice[];
  totals?: any;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}) {
  const summary = useInvoiceSummary({
    invoices,
    totals,
    page,
    pageSize,
    totalCount,
    totalPages,
  });

  if (!summary) return <div>No summary</div>;

  return (
    <div>
      <div data-testid="cell-description">{summary.description}</div>
      <div data-testid="cell-preVat">{summary.preVatAmount}</div>
      <div data-testid="cell-vat">{summary.vatAmount}</div>
      <div data-testid="cell-discount">{summary.discountAmount}</div>
      <div data-testid="cell-total">{summary.totalAmount}</div>
      <div data-testid="cell-netOff">{summary.netOffAmount}</div>
      <div data-testid="cell-remaining">{summary.remainingAmount}</div>
    </div>
  );
}

describe("useInvoiceSummary Hook Suite", () => {
  const mockInvoices: ErpInvoice[] = [
    {
      id: "inv-1",
      invoiceNo: "00001",
      serialNo: "1C26TGA",
      invoiceDate: "2026-08-01",
      direction: "IN",
      status: "CONFIRMED",
      preVatAmount: 10000000,
      vatAmount: 1000000,
      discountAmount: 0,
      totalAmount: 11000000,
      netOffAmount: "5000000",
    } as any,
    {
      id: "inv-2",
      invoiceNo: "00002",
      serialNo: "1C26TGA",
      invoiceDate: "2026-08-02",
      direction: "IN",
      status: "CONFIRMED",
      preVatAmount: 20000000,
      vatAmount: 2000000,
      discountAmount: 500000,
      totalAmount: 21500000,
      netOffAmount: "0",
    } as any,
  ];

  it("returns undefined when invoices is empty", () => {
    render(<SummaryTestComponent invoices={[]} />);
    expect(screen.getByText("No summary")).toBeInTheDocument();
  });

  it("renders SubtotalSummaryCell for all summary columns with cumulative and grand totals", () => {
    const totals = {
      grandTotalPreVat: 100000000,
      grandTotalVat: 10000000,
      grandTotalDiscount: 2000000,
      grandTotalAmount: 108000000,
      grandTotalNetOff: 30000000,
      grandTotalRemaining: 78000000,
      cumulativePreVat: 60000000,
      cumulativeVat: 6000000,
      cumulativeDiscount: 1000000,
      cumulativeTotal: 65000000,
      cumulativeNetOff: 15000000,
      cumulativeRemaining: 50000000,
    };

    render(
      <SummaryTestComponent
        invoices={mockInvoices}
        totals={totals}
        page={2}
        pageSize={2}
        totalCount={10}
        totalPages={5}
      />,
    );

    // Total Amount cell shows subtotal (32.500.000)
    const totalCell = screen.getByTestId("cell-total");
    expect(totalCell).toHaveTextContent("32.500.000");

    // Click total cell trigger to open Popover
    const trigger = screen.getByText(/32\.500\.000/);
    fireEvent.click(trigger);

    // Assert Popover elements
    expect(screen.getByText("Tổng tiền thanh toán")).toBeInTheDocument();
    expect(screen.getByText(/Trang 2\/5/)).toBeInTheDocument();
    expect(screen.getByText(/Lũy kế \(T1 → T2\):/)).toBeInTheDocument();
    expect(screen.getByText(/65\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText(/108\.000\.000/)).toBeInTheDocument();
    // 65M / 108M = 60.2%
    expect(screen.getByText("60.2%")).toBeInTheDocument();
  });
});
