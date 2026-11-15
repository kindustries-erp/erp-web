import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { StockBalanceRow } from "../../../domain/stockBalance";
import { buildStockBalanceColumns } from "./StockBalanceTable.columns";

const row: StockBalanceRow = {
  id: "b1",
  branchId: null,
  itemCode: "SKU-01",
  itemName: "Lọc dầu",
  unit: "Cái",
  qtyOnHand: 5,
  avgCost: 100,
  inventoryValue: 500,
  qtyReceived: 12,
  qtyIssued: 7,
  qtyAdjusted: -2,
  updatedAt: "2026-01-01",
};

const t = (_key: string, fallback?: string) => fallback ?? _key;

describe("buildStockBalanceColumns", () => {
  const columns = buildStockBalanceColumns(t, vi.fn());

  it("có đủ cột Nhập, Xuất, Điều chỉnh và Tồn", () => {
    const keys = columns.map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "itemCode",
        "itemName",
        "qtyReceived",
        "qtyIssued",
        "qtyAdjusted",
        "qtyOnHand",
      ]),
    );
  });

  it("hiển thị số nhập, xuất và điều chỉnh của dòng", () => {
    const byKey = (key: string) => columns.find((c) => c.key === key);
    const received = byKey("qtyReceived")?.cell?.(row, 0);
    const issued = byKey("qtyIssued")?.cell?.(row, 0);
    const adjusted = byKey("qtyAdjusted")?.cell?.(row, 0);
    render(
      <>
        <div>{received}</div>
        <div>{issued}</div>
        <div>{adjusted}</div>
      </>,
    );
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("-2")).toBeTruthy();
  });
});
