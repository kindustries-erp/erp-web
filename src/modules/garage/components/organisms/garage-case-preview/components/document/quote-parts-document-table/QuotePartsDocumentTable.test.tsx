import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuotePartsDocumentTable } from "./QuotePartsDocumentTable";
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

describe("QuotePartsDocumentTable", () => {
  const mockParts: QuoteLineItem[] = [
    {
      id: "pt-1",
      itemType: "PT",
      code: "PT-01",
      name: "Lọc nhớt",
      quantity: 2,
      unitPrice: 100000,
      discountRate: 0,
      amount: 200000,
      taxRate: 10,
      unitCost: 70000,
      totalCost: 140000,
      isInsurance: false,
    },
  ];

  it("renders parts list with cost and profit rows", () => {
    render(
      <QuotePartsDocumentTable
        parts={mockParts}
        partsTotalAmount={200000}
        partsTotalCost={140000}
      />,
    );

    expect(screen.getByText("PT-01")).toBeInTheDocument();
    expect(screen.getByText("Lọc nhớt")).toBeInTheDocument();
    expect(screen.getByText("70.000")).toBeInTheDocument();
    expect(screen.getAllByText("140.000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("60.000")).toBeInTheDocument(); // Lãi gộp (200k - 140k)
    expect(screen.getByText("30.0%")).toBeInTheDocument(); // Biên LN: 60k/200k = 30%
  });

  it("renders empty state when parts is empty", () => {
    render(
      <QuotePartsDocumentTable
        parts={[]}
        partsTotalAmount={0}
        partsTotalCost={0}
      />,
    );

    expect(screen.getByText("Không có vật tư phụ tùng")).toBeInTheDocument();
  });
});
