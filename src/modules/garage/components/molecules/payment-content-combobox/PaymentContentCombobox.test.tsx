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

  it("contains 12 numbered options with updated labels", () => {
    expect(PAYMENT_CONTENT_OPTIONS).toHaveLength(12);
    const values = PAYMENT_CONTENT_OPTIONS.map((o) => o.value);
    expect(values).toContain("1. KH thanh toán");
    expect(values).toContain("2. Tất toán");
    expect(values).toContain("3. BH thanh toán");
    expect(values).toContain("4. HHBH");
    expect(values).toContain("5. Ứng trước");
    expect(values).toContain("6. Cấn trừ");
    expect(values).toContain("7. Phụ tùng / vật tư");
    expect(values).toContain("8. Vật tư tiêu hao");
    expect(values).toContain("9. Chi phí vận hành");
    expect(values).toContain("10. Hoa hồng / nhân công");
    expect(values).toContain("11. Hoàn ứng");
    expect(values).toContain("12. Khác");
  });

  it("triggers onChange when selected", () => {
    const handleChange = vi.fn();
    render(
      <PaymentContentCombobox
        value="1. KH thanh toán"
        onChange={handleChange}
      />,
    );
    expect(screen.getByText("1. KH thanh toán")).toBeInTheDocument();
  });
});
