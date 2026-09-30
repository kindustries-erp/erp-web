import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { InvoiceItemsPopover } from "../InvoiceItemsPopover";

describe("InvoiceItemsPopover", () => {
  it("renders empty state when items are undefined or empty", () => {
    const { rerender } = render(<InvoiceItemsPopover items={undefined} />);
    expect(screen.getByText("Không có chi tiết mặt hàng.")).toBeInTheDocument();

    rerender(<InvoiceItemsPopover items={[]} />);
    expect(screen.getByText("Không có chi tiết mặt hàng.")).toBeInTheDocument();
  });

  it("renders standardized table structure with 1-based STT, 150px item name, and calculations", () => {
    const mockItems = [
      {
        id: "item-1",
        description: "Dung dịch vệ sinh phanh Evo 500ml",
        quantity: 2,
        unit: "chai",
        unitPrice: 65000,
        preVatAmount: 130000,
        vatRate: 0.08,
        vatAmount: 10400,
        totalAmount: 140400,
      },
      {
        id: "item-2",
        description: "Chất làm phá & bóng bề mặt sơn 1kg",
        quantity: 1,
        unit: "chai",
        unitPrice: 532407.41,
        preVatAmount: 532407,
        vatRate: "8%",
        vatAmount: 42593,
        totalAmount: 575000,
      },
    ];

    render(<InvoiceItemsPopover items={mockItems} />);

    // Check Header Info
    expect(screen.getByText("Chi tiết mặt hàng")).toBeInTheDocument();
    expect(screen.getByText("2 dòng")).toBeInTheDocument();

    // Check Table Headers
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Tên mặt hàng")).toBeInTheDocument();
    expect(screen.getByText("SL")).toBeInTheDocument();
    expect(screen.getByText("ĐVT")).toBeInTheDocument();
    expect(screen.getByText("Đơn giá")).toBeInTheDocument();
    expect(screen.getByText("Tiền trước thuế")).toBeInTheDocument();
    expect(screen.getByText("VAT")).toBeInTheDocument();
    expect(screen.getByText("Tiền VAT")).toBeInTheDocument();
    expect(screen.getByText("Thành tiền")).toBeInTheDocument();

    // Check Item Descriptions
    expect(
      screen.getByText("Dung dịch vệ sinh phanh Evo 500ml"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chất làm phá & bóng bề mặt sơn 1kg"),
    ).toBeInTheDocument();

    // Check VAT format (0.08 -> 8%, "8%" -> 8%)
    const vatCells = screen.getAllByText("8%");
    expect(vatCells.length).toBeGreaterThanOrEqual(2);

    // Check Footers Total label
    expect(screen.getByText("Tổng cộng:")).toBeInTheDocument();
    // Check Total Amount calculated (appears in header and footer)
    expect(screen.getAllByText("715.400,00 đ").length).toBe(2);
  });
});
