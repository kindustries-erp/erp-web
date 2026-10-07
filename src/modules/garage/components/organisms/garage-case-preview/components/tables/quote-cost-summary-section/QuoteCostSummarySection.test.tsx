import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteCostSummarySection } from "./QuoteCostSummarySection";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

// Mock CaseLinePaymentDrawer to inspect open state and props
vi.mock(
  "@/modules/garage/components/organisms/case-line-payment-drawer",
  () => ({
    CaseLinePaymentDrawer: (props: any) =>
      props.open ? (
        <div data-testid="mock-case-line-payment-drawer">
          Drawer Direction: {props.direction} | Amount: {props.lineAmount} |
          SettlementsCount: {props.activeSettlements?.length || 0} |
          InvoicesCount: {props.activeLinkedInvoices?.length || 0}
          <button type="button" onClick={props.onClose}>
            Mock Close
          </button>
        </div>
      ) : null,
  }),
);

describe("QuoteCostSummarySection", () => {
  const mockProps = {
    totalCostAmount: 10000000,
    activeSettlements: [
      {
        id: "settle-1",
        transDate: "2026-03-01",
        settlementType: "PAYMENT",
        sourceChannel: "OFF_SYSTEM_MANUAL",
        category: "TIEN_MAT_NGOAI",
        partnerName: "Cửa hàng phụ tùng A",
        amount: 2400000,
        note: "Tiền mua má phanh",
      },
      {
        id: "settle-2",
        transDate: "2026-03-02",
        settlementType: "RECEIPT", // Should be filtered out
        amount: 5000000,
      },
    ],
    activeLinkedInvoices: [
      {
        id: "inv-229",
        invoiceId: "inv-229",
        linkType: "IN",
        invoiceDate: "2026-03-03",
        invoiceNo: "229",
        sellerName: "Công ty Phụ Tùng Fast",
        totalAmount: 1176120,
        note: "HĐ phụ tùng đợt 1",
      },
      {
        id: "inv-out-1",
        linkType: "OUT", // Should be filtered out
        totalAmount: 9018000,
      },
    ],
    canPerformPayment: true,
    caseId: "case-001",
    caseCode: "GR-PDV-2026-001",
    caseData: { id: "case-001" },
  };

  it("renders summary row unifying both manual cashflow and linked IN invoices", () => {
    render(<QuoteCostSummarySection {...mockProps} />);

    // Total Cost = 10,000,000 (hiện diện ở cả hàng chi phí và summaryRow)
    expect(screen.getAllByText(/10.000.000/i).length).toBeGreaterThanOrEqual(1);
    // Paid = 2,400,000 (manual) + 1,176,120 (invoice) = 3,576,120
    expect(screen.getAllByText(/3.576.120/i).length).toBeGreaterThanOrEqual(1);
    // Remaining = 10,000,000 - 3,576,120 = 6,423,880
    expect(screen.getAllByText(/6.423.880/i).length).toBeGreaterThanOrEqual(1);
    // Button Chi tiền is rendered and enabled
    const payBtn = screen.getByRole("button", { name: /Chi tiền/i });
    expect(payBtn).toBeInTheDocument();
    expect(payBtn).not.toBeDisabled();

    // Cột HĐ đã cấn trừ hiển thị badge #229
    expect(screen.getByText("#229")).toBeInTheDocument();
  });

  it("filters and renders settlements table with both IN invoice and manual payment", () => {
    render(<QuoteCostSummarySection {...mockProps} />);

    // Header count: 2 items (1 manual settlement + 1 IN invoice)
    expect(screen.getByText(/Chi tiết các lần chi tiền/i)).toBeInTheDocument();
    expect(screen.getByText(/\(2\)/i)).toBeInTheDocument();

    // Table rows
    expect(screen.getByText("Cửa hàng phụ tùng A")).toBeInTheDocument();
    expect(screen.getByText(/2.400.000/i)).toBeInTheDocument();
    expect(screen.getByText("Công ty Phụ Tùng Fast")).toBeInTheDocument();
    expect(screen.getByText(/1.176.120/i)).toBeInTheDocument();
    expect(screen.getByText(/HĐ Đầu vào #229/i)).toBeInTheDocument();
  });

  it("opens CaseLinePaymentDrawer passing both activeSettlements and activeLinkedInvoices", () => {
    render(<QuoteCostSummarySection {...mockProps} />);

    const payButton = screen.getByRole("button", { name: /Chi tiền/i });
    fireEvent.click(payButton);

    expect(
      screen.getByTestId("mock-case-line-payment-drawer"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Drawer Direction: COST/i)).toBeInTheDocument();
    expect(screen.getByText(/SettlementsCount: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/InvoicesCount: 2/i)).toBeInTheDocument();
  });

  it("disables Chi tiền button when canPerformPayment is false and displays tooltip reason", () => {
    render(
      <QuoteCostSummarySection
        {...mockProps}
        canPerformPayment={false}
        disabledReason="Cần bật Chế độ chỉnh sửa để thao tác."
      />,
    );

    const payBtn = screen.getByRole("button", { name: /Chi tiền/i });
    expect(payBtn).toBeDisabled();
  });
});
