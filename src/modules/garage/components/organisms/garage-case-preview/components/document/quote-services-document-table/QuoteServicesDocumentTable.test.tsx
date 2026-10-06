import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuoteServicesDocumentTable } from "./QuoteServicesDocumentTable";
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

describe("QuoteServicesDocumentTable", () => {
  const mockServices: QuoteLineItem[] = [
    {
      id: "dv-1",
      itemType: "DV",
      code: "DV-01",
      name: "Bảo dưỡng 10.000km",
      quantity: 1,
      unitPrice: 350000,
      discountRate: 0,
      amount: 350000,
      taxRate: 10,
      unitCost: 0,
      totalCost: 0,
      technicianName: "Nguyễn Văn Kỹ Thuật",
      isInsurance: false,
    },
  ];

  it("renders services list and subtotal correctly", () => {
    render(
      <QuoteServicesDocumentTable
        services={mockServices}
        servicesTotalAmount={350000}
      />,
    );

    expect(screen.getByText("DV-01")).toBeInTheDocument();
    expect(screen.getByText("Bảo dưỡng 10.000km")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn Kỹ Thuật")).toBeInTheDocument();
    expect(screen.getAllByText("350.000").length).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state when services is empty", () => {
    render(
      <QuoteServicesDocumentTable services={[]} servicesTotalAmount={0} />,
    );

    expect(
      screen.getByText("Không có nhân công - dịch vụ"),
    ).toBeInTheDocument();
  });
});
