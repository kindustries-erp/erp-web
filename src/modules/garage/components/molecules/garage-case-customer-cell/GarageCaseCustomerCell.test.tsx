import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseCustomerCell } from "./GarageCaseCustomerCell";

describe("GarageCaseCustomerCell", () => {
  it("renders customer name and code correctly", () => {
    render(
      <GarageCaseCustomerCell
        item={{
          khachHangName: "Công ty TNHH Vận Tải ABC",
          khachHangCode: "KH00123",
        }}
      />,
    );

    expect(screen.getByText("Công ty TNHH Vận Tải ABC")).toBeDefined();
    expect(screen.getByText("KH00123")).toBeDefined();
  });

  it("renders fallback dash when both customer name and code are empty", () => {
    render(<GarageCaseCustomerCell item={{}} />);
    expect(screen.getByText("—")).toBeDefined();
  });

  it("renders only customer name if code is missing", () => {
    render(
      <GarageCaseCustomerCell
        item={{
          khachHangName: "Khách lẻ Nguyễn Văn A",
        }}
      />,
    );
    expect(screen.getByText("Khách lẻ Nguyễn Văn A")).toBeDefined();
    expect(screen.queryByText("Mã:")).toBeNull();
  });
});
