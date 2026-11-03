import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageGoodsReceiptLinesTable } from "./GarageGoodsReceiptLinesTable";
import type { GarageGoodsReceiptFormLine } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

describe("GarageGoodsReceiptLinesTable with Array Config", () => {
  const dummyLines: GarageGoodsReceiptFormLine[] = [
    {
      itemCode: "PART-001",
      itemName: "Má phanh Brembo",
      unit: "Bộ",
      qtyReceived: "2",
      unitCost: "500000",
      amount: "1000000",
      notes: "",
    },
  ];

  const t = (k: string, fb?: string) => fb || k;

  it("renders table header and rows using column config in viewing mode", () => {
    const onChangeLines = vi.fn();
    render(
      <GarageGoodsReceiptLinesTable
        lines={dummyLines}
        viewing={true}
        t={t}
        onChangeLines={onChangeLines}
      />,
    );

    expect(screen.getByText("Mã PT")).toBeDefined();
    expect(screen.getByText("Tên phụ tùng")).toBeDefined();
    expect(screen.getByText("PART-001")).toBeDefined();
    expect(screen.getByText("Má phanh Brembo")).toBeDefined();
    expect(screen.getByText("Bộ")).toBeDefined();
    expect(screen.getAllByText("1.000.000").length).toBe(2);
    // In view mode, action column should be hidden
    expect(screen.queryByLabelText("Xóa")).toBeNull();
  });

  it("renders inputs using column config in edit mode and updates line value", () => {
    const onChangeLines = vi.fn();
    render(
      <GarageGoodsReceiptLinesTable
        lines={dummyLines}
        viewing={false}
        t={t}
        onChangeLines={onChangeLines}
      />,
    );

    // Should have remove button
    expect(screen.getByLabelText("Xóa")).toBeDefined();

    // Change itemCode
    const itemCodeInput = screen.getByDisplayValue("PART-001");
    fireEvent.change(itemCodeInput, { target: { value: "PART-002" } });

    expect(onChangeLines).toHaveBeenCalledWith([
      expect.objectContaining({ itemCode: "PART-002" }),
    ]);
  });
});
