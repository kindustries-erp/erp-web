import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteServicesTable } from "./QuoteServicesTable";
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

describe("QuoteServicesTable", () => {
  const mockLines: QuoteLineItem[] = [
    {
      id: "dv-1",
      itemType: "DV",
      code: "DV-BD-01",
      name: "Bảo dưỡng định kỳ cấp 1",
      quantity: 1,
      unitPrice: 500000,
      discountRate: 0,
      amount: 500000,
      taxRate: 10,
      unitCost: 200000,
      totalCost: 200000,
      technicianName: "Nguyễn Văn A",
    },
  ];

  it("renders services lines correctly", () => {
    render(<QuoteServicesTable lines={mockLines} />);
    expect(screen.getByText("DV-BD-01")).toBeInTheDocument();
    expect(screen.getByText("Bảo dưỡng định kỳ cấp 1")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
  });

  it("handles payment click callback", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuoteServicesTable lines={mockLines} onPaymentClick={onPaymentClick} />,
    );

    const paymentBtn = screen.getByRole("button", { name: /Chi tiền/i });
    expect(paymentBtn).toBeInTheDocument();
    fireEvent.click(paymentBtn);
    expect(onPaymentClick).toHaveBeenCalledWith(mockLines[0]);
  });

  it("hides payment button when canEditFinancial is false", () => {
    const onPaymentClick = vi.fn();
    render(
      <QuoteServicesTable
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
    render(<QuoteServicesTable lines={[]} />);
    expect(
      screen.getByText("Chưa có danh mục dịch vụ - nhân công"),
    ).toBeInTheDocument();
  });
});
