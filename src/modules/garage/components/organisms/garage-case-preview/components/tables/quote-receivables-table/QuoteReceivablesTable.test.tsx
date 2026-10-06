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
});
