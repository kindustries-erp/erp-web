import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdjustmentItemsTable } from "./AdjustmentItemsTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentItemsTable", () => {
  it("renders items with net quantities", () => {
    const mockItems = [
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
    ];

    render(<AdjustmentItemsTable items={mockItems} />);

    expect(screen.getByText("Đối soát số lượng mặt hàng")).toBeInTheDocument();
    expect(screen.getByText("Lọc gió điều hòa")).toBeInTheDocument();
    expect(screen.getByText("VT01")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
