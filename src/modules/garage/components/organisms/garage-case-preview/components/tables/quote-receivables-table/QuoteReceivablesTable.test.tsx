import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteReceivablesTable } from "./QuoteReceivablesTable";

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
  const mockCaseData = {
    tienCoThue: 1296000,
    tienThanhToanKh: 1296000,
    tienThanhToanBh: 0,
  };

  const mockCaseWithInsurance = {
    tienCoThue: 10000000,
    tienThanhToanKh: 2000000,
    tienThanhToanBh: 8000000,
  };

  it("renders 1 parent target row with single collect button when no insurance", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuoteReceivablesTable
        caseData={mockCaseData}
        onPaymentClick={onPaymentClick}
      />,
    );

    expect(screen.getByText("Tổng phải thu vụ việc")).toBeInTheDocument();
    expect(screen.getByText("1.296.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();

    const collectBtn = screen.getByRole("button", { name: /Thu tiền/i });
    expect(collectBtn).toBeInTheDocument();
    fireEvent.click(collectBtn);
    expect(onPaymentClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "KH", payer: "KH" }),
    );
  });

  it("renders separate Thu KH and Thu BH buttons when insurance exists", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuoteReceivablesTable
        caseData={mockCaseWithInsurance}
        onPaymentClick={onPaymentClick}
      />,
    );

    expect(screen.getByText("10.000.000 ₫")).toBeInTheDocument();
    const btnKH = screen.getByRole("button", { name: /Thu KH/i });
    const btnBH = screen.getByRole("button", { name: /Thu BH/i });
    expect(btnKH).toBeInTheDocument();
    expect(btnBH).toBeInTheDocument();

    fireEvent.click(btnKH);
    expect(onPaymentClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "KH", payer: "KH", amount: 2000000 }),
    );

    fireEvent.click(btnBH);
    expect(onPaymentClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "BH", payer: "BH", amount: 8000000 }),
    );
  });

  it("renders child rows for linked invoices and settlements", () => {
    const activeLinkedInvoices = [
      {
        id: "inv-1",
        direction: "OUT",
        invoiceNo: "375",
        totalAmount: 1000000,
        buyerName: "Công ty ABC",
      },
    ];

    const activeSettlements = [
      {
        id: "set-1",
        settlementType: "RECEIPT",
        sourceChannel: "OFF_SYSTEM_MANUAL",
        amount: 296000,
        partnerName: "Khách lẻ",
      },
    ];

    render(
      <QuoteReceivablesTable
        caseData={mockCaseData}
        activeLinkedInvoices={activeLinkedInvoices}
        activeSettlements={activeSettlements}
      />,
    );

    expect(screen.getByText("HĐ Đầu ra #375")).toBeInTheDocument();
    expect(screen.getByText("1.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("77.2%")).toBeInTheDocument();

    expect(screen.getByText("Tiền mặt ngoài")).toBeInTheDocument();
    expect(screen.getByText("296.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("22.8%")).toBeInTheDocument();
  });

  it("calls onRemoveInvoice and onRemoveSettlement when delete buttons are clicked", () => {
    const onRemoveInvoice = vi.fn();
    const onRemoveSettlement = vi.fn();

    const activeLinkedInvoices = [
      {
        id: "inv-1",
        direction: "OUT",
        invoiceNo: "375",
        totalAmount: 1000000,
      },
    ];

    const activeSettlements = [
      {
        id: "set-1",
        settlementType: "RECEIPT",
        sourceChannel: "OFF_SYSTEM_MANUAL",
        amount: 296000,
      },
    ];

    render(
      <QuoteReceivablesTable
        caseData={mockCaseData}
        activeLinkedInvoices={activeLinkedInvoices}
        activeSettlements={activeSettlements}
        canEditFinancial={true}
        onRemoveInvoice={onRemoveInvoice}
        onRemoveSettlement={onRemoveSettlement}
      />,
    );

    const deleteButtons = screen.getAllByTitle("Xóa");
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(onRemoveInvoice).toHaveBeenCalledWith("inv-1");

    fireEvent.click(deleteButtons[1]);
    expect(onRemoveSettlement).toHaveBeenCalledWith("set-1");
  });

  it("disables collect button when canEditFinancial is false", () => {
    render(
      <QuoteReceivablesTable
        caseData={mockCaseData}
        canEditFinancial={false}
        disabledReason="Chế độ chỉ đọc"
      />,
    );

    const collectBtn = screen.getByRole("button", { name: /Thu tiền/i });
    expect(collectBtn).toBeDisabled();
  });
});
