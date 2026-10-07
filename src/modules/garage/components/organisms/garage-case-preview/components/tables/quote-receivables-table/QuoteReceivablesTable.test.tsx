import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteReceivablesTable } from "./QuoteReceivablesTable";
import type { QuoteReceivableRow } from "./QuoteReceivablesTable.type";

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

describe("QuoteReceivablesTable", () => {
  const mockItems: QuoteReceivableRow[] = [
    {
      id: "KH",
      stt: 1,
      payer: "KH",
      labelKey: "cases.quotePreview.fin.customerPayment",
      defaultLabel: "Khách hàng thanh toán",
      amount: 1500000,
    },
    {
      id: "BH",
      stt: 2,
      payer: "BH",
      labelKey: "cases.quotePreview.fin.insuranceApproved",
      defaultLabel: "Bảo hiểm thanh toán",
      amount: 2000000,
    },
  ];

  it("renders financial items correctly", () => {
    render(<QuoteReceivablesTable items={mockItems} />);
    expect(screen.getByText("Khách hàng thanh toán")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm thanh toán")).toBeInTheDocument();
  });

  it("handles KH and BH payment clicks separately", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuoteReceivablesTable
        items={mockItems}
        onPaymentClick={onPaymentClick}
      />,
    );

    const khButtons = screen.getAllByRole("button", { name: /Thu KH/i });
    expect(khButtons.length).toBeGreaterThan(0);
    fireEvent.click(khButtons[0]);
    expect(onPaymentClick).toHaveBeenCalledWith(mockItems[0]);

    const bhButtons = screen.getAllByRole("button", { name: /Thu BH/i });
    expect(bhButtons.length).toBeGreaterThan(0);
    fireEvent.click(bhButtons[0]);
    expect(onPaymentClick).toHaveBeenCalledWith(mockItems[1]);
  });

  it("derives rows from caseData if items not passed", () => {
    const caseData = {
      rawData: {
        TienThanhToanKH: 5000000,
        TienThanhToanBH: 10000000,
      },
    };
    render(<QuoteReceivablesTable caseData={caseData} />);
    expect(screen.getByText("Khách hàng thanh toán")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm thanh toán")).toBeInTheDocument();
  });

  it("disables payment buttons when canEditFinancial is false", () => {
    render(
      <QuoteReceivablesTable
        items={mockItems}
        canEditFinancial={false}
        disabledReason="Cần bật Chế độ chỉnh sửa"
      />,
    );
    const khButtons = screen.getAllByRole("button", { name: /Thu KH/i });
    expect(khButtons[0]).toBeDisabled();
    const bhButtons = screen.getAllByRole("button", { name: /Thu BH/i });
    expect(bhButtons[0]).toBeDisabled();
  });

  it("calculates collected and remaining amounts from activeSettlements", () => {
    const caseData = {
      rawData: {
        TienThanhToanKH: 5000000,
        TienThanhToanBH: 10000000,
      },
    };
    const activeSettlements = [
      {
        id: "s1",
        settlementType: "RECEIPT",
        amount: 3000000,
        payer: "KH",
      },
      {
        id: "s2",
        settlementType: "RECEIPT",
        amount: 4000000,
        partnerName: "Bảo hiểm Bảo Việt",
      },
    ];

    render(
      <QuoteReceivablesTable
        caseData={caseData}
        activeSettlements={activeSettlements}
      />,
    );

    // KH: Amount 5,000,000 | Collected 3,000,000 | Remaining 2,000,000
    expect(screen.getAllByText(/5.000.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3.000.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2.000.000/i).length).toBeGreaterThanOrEqual(1);

    // BH: Amount 10,000,000 | Collected 4,000,000 | Remaining 6,000,000
    expect(screen.getAllByText(/10.000.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4.000.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/6.000.000/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders linked invoices column correctly for KH and BH", () => {
    const caseData = {
      rawData: {
        TienThanhToanKH: 5000000,
        TienThanhToanBH: 10000000,
      },
    };
    const activeLinkedInvoices = [
      {
        id: "inv1",
        invoiceId: "inv1",
        invoiceNo: "1856",
        linkType: "OUT",
        totalAmount: 5000000,
        buyerName: "Công ty Khách Hàng",
        hasBankNetOff: true,
      },
      {
        id: "inv2",
        invoiceId: "inv2",
        invoiceNo: "2045",
        linkType: "OUT",
        totalAmount: 10000000,
        buyerName: "Bảo hiểm PVI",
        hasBankNetOff: false,
      },
    ];

    render(
      <QuoteReceivablesTable
        caseData={caseData}
        activeLinkedInvoices={activeLinkedInvoices}
      />,
    );

    // Should display both invoice badges
    expect(screen.getByText("#1856")).toBeInTheDocument();
    expect(screen.getByText("#2045")).toBeInTheDocument();
  });
});
