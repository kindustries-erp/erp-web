import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdjustmentTypeBadge } from "./AdjustmentTypeBadge";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdjustmentTypeBadge", () => {
  it("renders correctly for ADJUSTING role", () => {
    render(<AdjustmentTypeBadge role="ADJUSTING" />);
    expect(screen.getByText("Hóa đơn điều chỉnh")).toBeInTheDocument();
  });

  it("renders correctly for ORIGINAL role", () => {
    render(<AdjustmentTypeBadge role="ORIGINAL" />);
    expect(screen.getByText("Hóa đơn bị điều chỉnh")).toBeInTheDocument();
  });

  it("renders replacement badge when taxInvoiceStatus is 2", () => {
    render(<AdjustmentTypeBadge role="STANDARD" taxInvoiceStatus={2} />);
    expect(screen.getByText("Hóa đơn thay thế")).toBeInTheDocument();
  });
});
