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

  it("contains 13 numbered options with updated labels", () => {
    expect(PAYMENT_CONTENT_OPTIONS).toHaveLength(13);
    const values = PAYMENT_CONTENT_OPTIONS.map((o) => o.value);
    expect(values).toEqual([
      "1. KH thanh toán",
      "2. Tất toán",
      "3. BH thanh toán",
      "4. HHBH",
      "5. HH Bán hàng",
      "6. HH Xưởng",
      "7. Ứng trước",
      "8. Cấn trừ",
      "9. Phụ tùng / vật tư",
      "10. Vật tư tiêu hao",
      "11. Chi phí vận hành",
      "12. Hoàn ứng",
      "13. Khác",
    ]);
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
