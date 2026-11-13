import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StockVoucherTypeConfig } from "../../../inventoryMovements.config.type";
import {
  StockVoucherStatusBadge,
  StockVoucherTypeBadge,
} from "./StockVoucherBadges";

const types: readonly StockVoucherTypeConfig[] = [
  {
    code: "ISSUE",
    labelKey: "v2.test.issue",
    labelFallback: "Xuất kho",
    direction: "OUT",
  },
];

describe("StockVoucherTypeBadge", () => {
  it("hiển thị nhãn của loại đã khai báo", () => {
    render(<StockVoucherTypeBadge type="ISSUE" types={types} />);
    expect(screen.getByText("Xuất kho")).toBeTruthy();
  });

  it("hiển thị mã gốc khi loại không được khai báo", () => {
    render(<StockVoucherTypeBadge type="UNKNOWN_X" types={types} />);
    expect(screen.getByText("UNKNOWN_X")).toBeTruthy();
  });
});

describe("StockVoucherStatusBadge", () => {
  it("POSTED hiển thị 'Đã ghi sổ'", () => {
    render(<StockVoucherStatusBadge status="POSTED" />);
    expect(screen.getByText("Đã ghi sổ")).toBeTruthy();
  });

  it("CANCELLED hiển thị 'Đã hủy'", () => {
    render(<StockVoucherStatusBadge status="CANCELLED" />);
    expect(screen.getByText("Đã hủy")).toBeTruthy();
  });

  it("trạng thái khác hoặc rỗng hiển thị 'Nháp'", () => {
    render(<StockVoucherStatusBadge status={null} />);
    expect(screen.getByText("Nháp")).toBeTruthy();
  });
});
