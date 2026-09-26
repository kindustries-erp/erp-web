import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErpInvoiceDetailLinesTable } from "../ErpInvoiceDetailLinesTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("ErpInvoiceDetailLinesTable", () => {
  const mockInvoiceWithItems: any = {
    id: "inv-1",
    invoiceNo: "0006362",
    serialNo: "C26MVT",
    direction: "IN",
    items: [
      {
        id: "line-1",
        description: "BÁNH TRUNG THU NHÂN THẬP CẨM LẠP XƯỞNG 150GR",
        unit: "Cái",
        quantity: 50,
        unitPrice: 97898.14,
        discountAmount: 0,
        vatRate: 0.08,
        vatAmount: 391592.56,
        preVatAmount: 4894907,
        totalAmount: 5286499.56,
      },
      {
        id: "line-2",
        description: "Tem UV",
        unit: "Cái",
        quantity: 25,
        unitPrice: 10777.76,
        discountAmount: 0,
        vatRate: 8,
        vatAmount: 21555.52,
        preVatAmount: 269444,
        totalAmount: 290999.52,
      },
    ],
  };

  it("renders empty state when there are no items", () => {
    render(<ErpInvoiceDetailLinesTable invoice={{ id: "inv-empty" } as any} />);

    expect(
      screen.getByText("Không có dòng hàng hóa, dịch vụ"),
    ).toBeInTheDocument();
  });

  it("renders item lines and table columns properly", () => {
    render(<ErpInvoiceDetailLinesTable invoice={mockInvoiceWithItems} />);

    expect(
      screen.getByText("BÁNH TRUNG THU NHÂN THẬP CẨM LẠP XƯỞNG 150GR"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tem UV")).toBeInTheDocument();
    expect(screen.getAllByText("Cái").length).toBe(2);
    expect(screen.getAllByText("8%").length).toBe(2);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders summaryRow calculating total quantity and amounts", () => {
    render(<ErpInvoiceDetailLinesTable invoice={mockInvoiceWithItems} />);

    expect(screen.getByText("Tổng cộng:")).toBeInTheDocument();
  });
});
