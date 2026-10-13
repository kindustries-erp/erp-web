import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PaymentContentCombobox,
  PAYMENT_CONTENT_OPTIONS,
} from "./PaymentContentCombobox";

describe("PaymentContentCombobox Molecule", () => {
  it("renders with placeholder", () => {
    render(<PaymentContentCombobox placeholder="Chọn nội dung TT..." />);
    expect(screen.getByText("Chọn nội dung TT...")).toBeInTheDocument();
  });

  it("contains specified business options", () => {
    const values = PAYMENT_CONTENT_OPTIONS.map((o) => o.value);
    expect(values).toContain("KH thanh toán");
    expect(values).toContain("Tất toán");
    expect(values).toContain("BH thanh toán");
    expect(values).toContain("HHBH");
    expect(values).toContain("Ứng trước");
    expect(values).toContain("Cấn trừ");
  });

  it("triggers onChange when selected", () => {
    const handleChange = vi.fn();
    render(
      <PaymentContentCombobox value="KH thanh toán" onChange={handleChange} />,
    );
    expect(screen.getByText("KH thanh toán")).toBeInTheDocument();
  });
});
