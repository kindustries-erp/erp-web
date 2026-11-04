import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoodsReceiptLinesTable } from "./GoodsReceiptLinesTable";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";

describe("GoodsReceiptLinesTable", () => {
  const dummyLines: GoodsReceiptFormLine[] = [
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
    render(
      <GoodsReceiptLinesTable
        lines={dummyLines}
        viewing={true}
        t={t}
        onChangeLines={vi.fn()}
      />,
    );

    expect(screen.getByText("Mã PT")).toBeDefined();
    expect(screen.getByText("Tên phụ tùng")).toBeDefined();
    expect(screen.getByText("PART-001")).toBeDefined();
    expect(screen.getByText("Má phanh Brembo")).toBeDefined();
    expect(screen.getByText("Bộ")).toBeDefined();
    expect(screen.getAllByText("1.000.000").length).toBe(2);
    // Ở chế độ xem, cột thao tác bị ẩn
    expect(screen.queryByLabelText("Xóa")).toBeNull();
  });

  it("renders inputs in edit mode and updates line value", () => {
    const onChangeLines = vi.fn();
    render(
      <GoodsReceiptLinesTable
        lines={dummyLines}
        viewing={false}
        t={t}
        onChangeLines={onChangeLines}
      />,
    );

    expect(screen.getByLabelText("Xóa")).toBeDefined();

    const itemCodeInput = screen.getByDisplayValue("PART-001");
    fireEvent.change(itemCodeInput, { target: { value: "PART-002" } });

    expect(onChangeLines).toHaveBeenCalledWith([
      expect.objectContaining({ itemCode: "PART-002" }),
    ]);
  });

  it("adds a line with default unit and a stable client key", () => {
    const onChangeLines = vi.fn();
    render(
      <GoodsReceiptLinesTable
        lines={[]}
        viewing={false}
        t={t}
        onChangeLines={onChangeLines}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Thêm phụ tùng/i }));

    const [next] = onChangeLines.mock.calls[0][0] as GoodsReceiptFormLine[];
    expect(next.unit).toBe("Cái");
    expect(next.clientKey).toBeTruthy();
  });
});
