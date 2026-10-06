import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelatedInvoiceSidebarSection } from "./RelatedInvoiceSidebarSection";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("./RelatedInvoiceSidebarSection.hook", () => ({
  useRelatedInvoiceSidebarSection: () => ({
    t: (key: string) => key,
    isAdjustmentOrReplacement: true,
    isOriginalAdjustedOrReplaced: false,
    originalInvoiceRes: {
      id: "orig-1",
      invoiceNo: "142",
      totalAmount: "2000000",
      invoiceDate: "2024-05-01",
    },
    loadingOriginal: false,
    adjustingInvoicesRes: [],
    loadingAdjusting: false,
    handleOpenInvoice: vi.fn(),
    handleExecuteNetoff: vi.fn(),
    reconciliation: {
      role: "ADJUSTING",
      financial: {
        originalAmount: 2000000,
        adjustedDeltaAmount: -500000,
        netEffectiveAmount: 1500000,
        isFullyCancelled: false,
        netoffOffsetAmount: 500000,
        remainingDebt: 0,
      },
      itemReconciliations: [
        {
          itemCode: "VT01",
          description: "Lọc gió điều hòa",
          originalQty: 3,
          adjustedDeltaQty: -1,
          netEffectiveQty: 2,
          unit: "Cái",
          unitPrice: 500000,
          netAmount: 1000000,
        },
      ],
      infoDiff: {
        hasInfoAdjustment: true,
        diffs: [
          {
            field: "buyerTaxCode",
            fieldNameVi: "Mã số thuế",
            oldValue: "0315",
            newValue: "0316",
          },
        ],
      },
      relatedInvoices: [],
    },
    isExecutingNetoff: false,
    relatedInvNo: "142",
    taxStatus: 3,
  }),
}));

describe("RelatedInvoiceSidebarSection", () => {
  it("renders related original invoice link and reconciliation sections", () => {
    const mockInvoice: any = {
      id: "adj-1",
      invoiceNo: "146",
      totalAmount: "-500000",
      relatedInvoiceNo: "142",
      taxInvoiceStatus: 3,
    };

    render(
      <RelatedInvoiceSidebarSection invoice={mockInvoice} direction="OUT" />,
    );

    expect(screen.getByText("#142")).toBeInTheDocument();
    expect(screen.getByText("Cân đối tài chính & Dư nợ")).toBeInTheDocument();
    expect(screen.getByText("Thay đổi thông tin hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Đối soát số lượng mặt hàng")).toBeInTheDocument();
  });
});
