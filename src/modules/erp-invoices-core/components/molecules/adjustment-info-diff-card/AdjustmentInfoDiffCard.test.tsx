import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdjustmentInfoDiffCard } from "./AdjustmentInfoDiffCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentInfoDiffCard", () => {
  it("renders diff items correctly", () => {
    const mockDiffs = [
      {
        field: "buyerTaxCode",
        fieldNameVi: "Mã số thuế",
        oldValue: "0315000000",
        newValue: "0316999999",
      },
    ];

    render(<AdjustmentInfoDiffCard diffs={mockDiffs} />);

    expect(screen.getByText("Thay đổi thông tin hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Mã số thuế")).toBeInTheDocument();
    expect(screen.getByText("0315000000")).toBeInTheDocument();
    expect(screen.getByText("0316999999")).toBeInTheDocument();
  });

  it("returns null when diffs array is empty", () => {
    const { container } = render(<AdjustmentInfoDiffCard diffs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
