import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoodsReceiptStatus } from "@/v2/core/goods-receipts";
import { GoodsReceiptStatusBadge } from "./GoodsReceiptStatusBadge";

describe("GoodsReceiptStatusBadge", () => {
  it("shows the posted label for POSTED receipts", () => {
    render(<GoodsReceiptStatusBadge status={GoodsReceiptStatus.POSTED} />);
    expect(screen.getByText("Đã ghi sổ")).toBeInTheDocument();
  });

  it("shows the cancelled label for CANCELLED receipts", () => {
    render(<GoodsReceiptStatusBadge status={GoodsReceiptStatus.CANCELLED} />);
    expect(screen.getByText("Đã hủy")).toBeInTheDocument();
  });

  it("shows the draft label for DRAFT receipts", () => {
    render(<GoodsReceiptStatusBadge status={GoodsReceiptStatus.DRAFT} />);
    expect(screen.getByText("Nháp")).toBeInTheDocument();
  });
});
