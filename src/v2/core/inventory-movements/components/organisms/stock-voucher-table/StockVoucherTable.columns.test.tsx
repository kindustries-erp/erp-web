import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { StockVoucherRow } from "../../../domain/stockVoucher";
import type { StockVoucherTypeConfig } from "../../../inventoryMovements.config.type";
import { buildStockVoucherColumns } from "./StockVoucherTable.columns";

const types: readonly StockVoucherTypeConfig[] = [
  {
    code: "ISSUE",
    labelKey: "v2.test.issue",
    labelFallback: "Xuất kho",
    direction: "OUT",
  },
  {
    code: "ADJUSTMENT",
    labelKey: "v2.test.adjustment",
    labelFallback: "Điều chỉnh",
    direction: "ADJUST",
  },
];

const t = (_key: string, fallback?: string) => fallback ?? _key;

const row = {
  id: "v1",
  type: "ISSUE",
  voucherNo: "PX-0001",
  voucherDate: "2026-01-05T00:00:00Z",
  status: "POSTED",
  partnerName: null,
  totalAmount: 150000,
  remarks: null,
} as unknown as StockVoucherRow;

describe("buildStockVoucherColumns", () => {
  it("khai báo đủ cột danh sách chứng từ", () => {
    const keys = buildStockVoucherColumns(t, types, vi.fn()).map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "voucherNo",
        "type",
        "voucherDate",
        "partnerName",
        "totalAmount",
        "status",
        "remarks",
      ]),
    );
  });

  it("bộ lọc Loại có đúng một lựa chọn cho mỗi loại đã khai báo", () => {
    const typeCol = buildStockVoucherColumns(t, types, vi.fn()).find(
      (c) => c.key === "type",
    );
    const options = (typeCol?.filter as { filterOptions?: unknown[] })
      ?.filterOptions;
    expect(options).toEqual([
      { value: "ISSUE", label: "Xuất kho" },
      { value: "ADJUSTMENT", label: "Điều chỉnh" },
    ]);
  });

  it("bấm nút chi tiết ở Số phiếu gọi openDetail với đúng dòng", () => {
    const openDetail = vi.fn();
    const col = buildStockVoucherColumns(t, types, openDetail).find(
      (c) => c.key === "voucherNo",
    );
    render(<>{col?.cell?.(row, 0)}</>);
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    expect(openDetail).toHaveBeenCalledWith(row);
  });

  it("hiển thị badge loại và trạng thái, ô đối tác rỗng thành dấu gạch", () => {
    const cols = buildStockVoucherColumns(t, types, vi.fn());
    const byKey = (key: string) => cols.find((c) => c.key === key);
    render(
      <>
        <div>{byKey("type")?.cell?.(row, 0)}</div>
        <div>{byKey("status")?.cell?.(row, 0)}</div>
        <div>{byKey("partnerName")?.cell?.(row, 0)}</div>
      </>,
    );
    expect(screen.getByText("Xuất kho")).toBeTruthy();
    expect(screen.getByText("Đã ghi sổ")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
  });
});
