import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PurchaseOrderFormLine } from "../../../domain/purchaseOrderLine";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";

const t = (_key: string, fallback?: string) => fallback ?? "";

const line = (
  over: Partial<PurchaseOrderFormLine> = {},
): PurchaseOrderFormLine => ({
  clientKey: "k1",
  itemCode: "VT-1",
  itemName: "Lọc gió",
  description: "",
  qtyOrdered: "2",
  qtyReceived: "0",
  unitPrice: "1000",
  amount: "2000",
  ...over,
});

describe("PurchaseOrderLinesTable", () => {
  it("thêm dòng mới qua nút Thêm dòng", () => {
    const onChangeLines = vi.fn();
    render(
      <PurchaseOrderLinesTable
        lines={[]}
        viewing={false}
        creating
        t={t}
        onChangeLines={onChangeLines}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Thêm dòng/ }));
    expect(onChangeLines).toHaveBeenCalledWith([
      expect.objectContaining({ qtyOrdered: "1", unitPrice: "0", amount: "0" }),
    ]);
  });

  it("đổi đơn giá thì tính lại thành tiền theo số lượng đặt", () => {
    const onChangeLines = vi.fn();
    render(
      <PurchaseOrderLinesTable
        lines={[line()]}
        viewing={false}
        creating={false}
        t={t}
        onChangeLines={onChangeLines}
      />,
    );
    const priceInput = screen.getByDisplayValue("1.000");
    fireEvent.change(priceInput, { target: { value: "1500" } });
    expect(onChangeLines).toHaveBeenLastCalledWith([
      expect.objectContaining({ unitPrice: "1500", amount: "3000" }),
    ]);
  });

  it("chế độ xem ẩn nút thêm và cột thao tác, hiện SL đã nhận", () => {
    render(
      <PurchaseOrderLinesTable
        lines={[line({ qtyReceived: "1" })]}
        viewing
        creating={false}
        t={t}
        onChangeLines={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Thêm dòng/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Xóa" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("SL đã nhận")).toBeInTheDocument();
  });

  it("khi tạo mới ẩn cột SL đã nhận", () => {
    render(
      <PurchaseOrderLinesTable
        lines={[line()]}
        viewing={false}
        creating
        t={t}
        onChangeLines={vi.fn()}
      />,
    );
    expect(screen.queryByText("SL đã nhận")).not.toBeInTheDocument();
  });

  it("hiện tổng thành tiền trong chân bảng", () => {
    render(
      <PurchaseOrderLinesTable
        lines={[
          line(),
          line({ clientKey: "k2", qtyOrdered: "2", unitPrice: "250" }),
        ]}
        viewing={false}
        creating={false}
        t={t}
        onChangeLines={vi.fn()}
      />,
    );
    expect(screen.getByText("2.500")).toBeInTheDocument();
  });
});
