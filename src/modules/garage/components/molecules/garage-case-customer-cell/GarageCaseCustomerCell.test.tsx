import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCaseCustomerCell } from "./GarageCaseCustomerCell";

describe("GarageCaseCustomerCell", () => {
  it("hiện tên danh mục và dòng phụ tên trên phiếu khi hai tên khác nhau", () => {
    render(
      <GarageCaseCustomerCell
        item={{
          khachHangName: "ACTR",
          khachHangCode: "KH-ACTR",
          tenKhachHang: "SAILUN",
        }}
      />,
    );
    expect(screen.getByText("ACTR")).toBeInTheDocument();
    expect(screen.getByTestId("garage-case-voucher-name")).toHaveTextContent(
      "SAILUN",
    );
  });

  it("không hiện dòng phụ khi tên trên phiếu trùng tên danh mục", () => {
    render(
      <GarageCaseCustomerCell
        item={{ khachHangName: "ACTR", tenKhachHang: "ACTR" }}
      />,
    );
    expect(
      screen.queryByTestId("garage-case-voucher-name"),
    ).not.toBeInTheDocument();
  });

  it("nhận tên trên phiếu V2 (voucherCustomerName) khi chỉ có tên trên phiếu", () => {
    render(
      <GarageCaseCustomerCell item={{ voucherCustomerName: "Khách lẻ" }} />,
    );
    expect(screen.getByTestId("garage-case-voucher-name")).toHaveTextContent(
      "Khách lẻ",
    );
  });
});
