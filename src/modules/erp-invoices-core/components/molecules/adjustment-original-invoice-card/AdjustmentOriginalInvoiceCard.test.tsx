import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdjustmentOriginalInvoiceCard } from "./AdjustmentOriginalInvoiceCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentOriginalInvoiceCard", () => {
  it("renders empty state when relatedInvNo is missing", () => {
    render(<AdjustmentOriginalInvoiceCard onOpenInvoice={vi.fn()} />);
    expect(
      screen.getByText("Chưa ghi nhận số hóa đơn gốc."),
    ).toBeInTheDocument();
  });

  it("renders invoice details and triggers onOpenInvoice when clicked", () => {
    const onOpen = vi.fn();
    render(
      <AdjustmentOriginalInvoiceCard
        relatedInvNo="1474"
        relatedSerNo="C26TGA"
        originalInvoice={{
          id: "inv-1474",
          invoiceNo: "1474",
          totalAmount: 946980,
          invoiceDate: "2026-08-25",
        }}
        onOpenInvoice={onOpen}
      />,
    );

    expect(screen.getByText("#1474")).toBeInTheDocument();
    expect(screen.getByText("(C26TGA)")).toBeInTheDocument();
    expect(screen.getByText(/946\.980/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledWith("inv-1474", "1474");
  });
});
