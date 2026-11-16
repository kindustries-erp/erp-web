import { describe, expect, it } from "vitest";
import { calculateStockLedger } from "./stockLedgerCalculator";
import type { StockTransactionRow } from "../../../domain/stockBalance";

describe("stockLedgerCalculator", () => {
  const sampleTransactions: StockTransactionRow[] = [
    {
      id: "tx-1",
      transactionDate: "2026-01-01T08:00:00Z",
      transactionType: "RECEIPT",
      documentType: "PURCHASE_RECEIPT",
      documentId: "pr-1",
      documentNo: "PN-001",
      qtyIn: 10,
      qtyOut: 0,
      unitCost: 100,
    },
    {
      id: "tx-2",
      transactionDate: "2026-01-05T08:00:00Z",
      transactionType: "RECEIPT",
      documentType: "PURCHASE_RECEIPT",
      documentId: "pr-2",
      documentNo: "PN-002",
      qtyIn: 10,
      qtyOut: 0,
      unitCost: 200,
    },
    {
      id: "tx-3",
      transactionDate: "2026-01-10T08:00:00Z",
      transactionType: "ISSUE",
      documentType: "ISSUE",
      documentId: "is-1",
      documentNo: "PX-001",
      qtyIn: 0,
      qtyOut: 15,
      unitCost: 0,
    },
  ];

  it("handles empty transactions safely", () => {
    const result = calculateStockLedger([]);
    expect(result.rows).toHaveLength(0);
    expect(result.totals.finalBalanceQty).toBe(0);
    expect(result.totals.totalAdjustedQty).toBe(0);
  });

  it("calculates moving weighted average (WEIGHTED_AVG) accurately", () => {
    const result = calculateStockLedger(sampleTransactions, "WEIGHTED_AVG");

    expect(result.rows).toHaveLength(3);
    // Rows are reversed (newest tx-3 first)
    const [row3, row2, row1] = result.rows;

    expect(row1.id).toBe("tx-1");
    expect(row1.balanceQty).toBe(10);
    expect(row1.balanceValue).toBe(1000);
    expect(row1.inTotal).toBe(1000);
    expect(row1.unitCost).toBe(100);

    expect(row2.id).toBe("tx-2");
    expect(row2.balanceQty).toBe(20);
    expect(row2.balanceValue).toBe(3000);
    expect(row2.balanceUnitCost).toBe(150);
    expect(row2.unitCost).toBe(200);

    // Row 3: Xuất 15 cái với giá bình quân 150 -> Giá vốn xuất 2250, Tồn còn lại 5 cái @ 150 = 750
    expect(row3.id).toBe("tx-3");
    expect(row3.balanceQty).toBe(5);
    expect(row3.outUnitCost).toBe(150);
    expect(row3.unitCost).toBe(150);
    expect(row3.outTotal).toBe(2250);
    expect(row3.balanceValue).toBe(750);

    expect(result.totals).toEqual({
      totalInQty: 20,
      totalInValue: 3000,
      totalOutQty: 15,
      totalOutValue: 2250,
      totalAdjustedQty: 0,
      finalBalanceQty: 5,
      finalBalanceValue: 750,
    });
  });

  it("calculates FIFO accurately", () => {
    const result = calculateStockLedger(sampleTransactions, "FIFO");

    expect(result.rows).toHaveLength(3);
    const [row3, , row1] = result.rows;

    expect(row1.balanceQty).toBe(10);
    expect(row1.balanceValue).toBe(1000);

    // Row 3 xuất 15:
    // 10 từ lô 1 @ 100 = 1000
    // 5 từ lô 2 @ 200 = 1000
    // Tổng giá vốn FIFO = 2000, Đơn giá xuất = 2000/15 = 133.33
    // Tồn còn 5 của lô 2 @ 200 = 1000
    expect(row3.id).toBe("tx-3");
    expect(row3.balanceQty).toBe(5);
    expect(row3.outTotal).toBe(2000);
    expect(row3.outUnitCost).toBe(133.33);
    expect(row3.unitCost).toBe(133.33);
    expect(row3.balanceValue).toBe(1000);

    expect(result.totals).toEqual({
      totalInQty: 20,
      totalInValue: 3000,
      totalOutQty: 15,
      totalOutValue: 2000,
      totalAdjustedQty: 0,
      finalBalanceQty: 5,
      finalBalanceValue: 1000,
    });
  });

  it("calculates inventory ADJUSTMENT accurately", () => {
    const txWithAdjustment: StockTransactionRow[] = [
      ...sampleTransactions,
      {
        id: "tx-4",
        transactionDate: "2026-01-15T08:00:00Z",
        transactionType: "ADJUSTMENT",
        documentType: "ADJUSTMENT",
        documentId: "adj-1",
        documentNo: "KK-001",
        qtyIn: 0,
        qtyOut: 2,
        unitCost: 150,
      },
    ];

    const result = calculateStockLedger(txWithAdjustment, "WEIGHTED_AVG");
    expect(result.rows).toHaveLength(4);
    const row4 = result.rows[0];

    expect(row4.id).toBe("tx-4");
    expect(row4.qtyAdjusted).toBe(-2);
    expect(row4.qtyIn).toBe(0);
    expect(row4.qtyOut).toBe(0);
    expect(row4.balanceQty).toBe(3); // 5 - 2 = 3
    expect(result.totals.totalAdjustedQty).toBe(-2);
  });
});
