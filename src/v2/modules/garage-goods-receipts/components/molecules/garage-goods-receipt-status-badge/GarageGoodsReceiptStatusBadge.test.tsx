import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GarageGoodsReceiptStatus } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { GarageGoodsReceiptStatusBadge } from "./GarageGoodsReceiptStatusBadge";

describe("GarageGoodsReceiptStatusBadge", () => {
  it("shows the posted label for POSTED receipts", () => {
    render(
      <GarageGoodsReceiptStatusBadge
        status={GarageGoodsReceiptStatus.POSTED}
      />,
    );
    expect(screen.getByText("Đã ghi sổ")).toBeInTheDocument();
  });

  it("shows the cancelled label for CANCELLED receipts", () => {
    render(
      <GarageGoodsReceiptStatusBadge
        status={GarageGoodsReceiptStatus.CANCELLED}
      />,
    );
    expect(screen.getByText("Đã hủy")).toBeInTheDocument();
  });

  it("shows the draft label for DRAFT receipts", () => {
    render(
      <GarageGoodsReceiptStatusBadge status={GarageGoodsReceiptStatus.DRAFT} />,
    );
    expect(screen.getByText("Phiếu nháp")).toBeInTheDocument();
  });
});
