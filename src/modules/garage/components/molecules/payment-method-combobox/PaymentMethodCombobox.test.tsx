import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PaymentMethodCombobox,
  PAYMENT_METHOD_OPTIONS,
} from "./PaymentMethodCombobox";

describe("PaymentMethodCombobox Molecule", () => {
  it("có Chuyển khoản khác ngay sau Chuyển khoản", () => {
    expect(PAYMENT_METHOD_OPTIONS.map((o) => o.value)).toEqual([
      "Tiền mặt",
      "Chuyển khoản",
      "Chuyển khoản khác",
      "Thẻ tín dụng",
      "Khác",
    ]);
  });

  it("hiển thị giá trị đang chọn", () => {
    render(<PaymentMethodCombobox value="Chuyển khoản khác" />);
    expect(screen.getByText("Chuyển khoản khác")).toBeInTheDocument();
  });
});
