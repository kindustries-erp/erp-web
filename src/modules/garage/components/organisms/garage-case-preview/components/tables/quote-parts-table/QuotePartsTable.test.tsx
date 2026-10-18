import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuotePartsTable } from "./QuotePartsTable";
import type { QuoteLineItem } from "../../../GarageCasePreview.type";

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

describe("QuotePartsTable", () => {
  const mockLines: QuoteLineItem[] = [
    {
      id: "pt-1",
      itemType: "PT",
      code: "PT-LOC-01",
      name: "Lọc nhớt động cơ",
      quantity: 2,
      unitPrice: 150000,
      discountRate: 5,
      amount: 285000,
      taxRate: 10,
      unitCost: 100000,
      totalCost: 200000,
      technicianName: "Trần Văn B",
      isInsurance: true,
      insuranceApprovedAmount: 285000,
    },
  ];

  it("renders parts lines correctly", () => {
    render(<QuotePartsTable lines={mockLines} />);
    expect(screen.getByText("PT-LOC-01")).toBeInTheDocument();
    expect(screen.getByText("Lọc nhớt động cơ")).toBeInTheDocument();
    expect(screen.getByText("Trần Văn B")).toBeInTheDocument();
  });

  it("handles payment click callback", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuotePartsTable lines={mockLines} onPaymentClick={onPaymentClick} />,
    );

    const paymentBtn = screen.getByRole("button", { name: /Chi tiền/i });
    fireEvent.click(paymentBtn);
    expect(onPaymentClick).toHaveBeenCalledWith(mockLines[0]);
  });

  it("hides payment button when canEditFinancial is false", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuotePartsTable
        lines={mockLines}
        onPaymentClick={onPaymentClick}
        canEditFinancial={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Chi tiền/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("---")).toBeInTheDocument();
  });

  it("shows empty state when no lines", () => {
    render(<QuotePartsTable lines={[]} />);
    expect(
      screen.getByText("Chưa có danh mục vật tư hoặc phụ tùng"),
    ).toBeInTheDocument();
  });
});
