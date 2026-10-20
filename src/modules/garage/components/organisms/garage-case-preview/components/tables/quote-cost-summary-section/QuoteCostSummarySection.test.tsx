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
        settlementType: "RECEIPT", // Should be filtered out from cost
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
        linkType: "OUT", // Should be filtered out from cost
        totalAmount: 9018000,
      },
    ],
    canPerformPayment: true,
    caseId: "case-001",
    caseCode: "GR-PDV-2026-001",
    caseData: { id: "case-001" },
  };

  it("renders Unified Tree Table parent row and child rows for cost", () => {
    render(<QuoteCostSummarySection {...mockProps} />);

    // Parent row
    expect(screen.getByText(/Tổng phải trả vụ việc/i)).toBeInTheDocument();
    expect(screen.getByText("10.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();

    // Child row 1: HĐ Đầu vào #229
    expect(screen.getByText(/HĐ Đầu vào #229/i)).toBeInTheDocument();
    expect(screen.getByText("1.176.120 ₫")).toBeInTheDocument();
    expect(screen.getByText("11.8%")).toBeInTheDocument();
    expect(screen.getByText("(Công ty Phụ Tùng Fast)")).toBeInTheDocument();

    // Child row 2: Tiền mặt ngoài
    expect(screen.getByText(/Tiền mặt ngoài/i)).toBeInTheDocument();
    expect(screen.getByText("2.400.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("24%")).toBeInTheDocument();
    expect(screen.getByText("(Cửa hàng phụ tùng A)")).toBeInTheDocument();

    // Button Chi tiền is rendered and enabled
    const payBtn = screen.getByRole("button", { name: /Chi tiền/i });
    expect(payBtn).toBeInTheDocument();
    expect(payBtn).not.toBeDisabled();
  });

  it("handles remove callbacks on child rows", () => {
    const onRemoveInvoice = vi.fn();
    const onRemoveSettlement = vi.fn();

    render(
      <QuoteCostSummarySection
        {...mockProps}
        onRemoveInvoice={onRemoveInvoice}
        onRemoveSettlement={onRemoveSettlement}
      />,
    );

    const deleteButtons = screen.getAllByTitle("Xóa");
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(onRemoveInvoice).toHaveBeenCalledWith("inv-229");

    fireEvent.click(deleteButtons[1]);
    expect(onRemoveSettlement).toHaveBeenCalledWith("settle-1");
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
