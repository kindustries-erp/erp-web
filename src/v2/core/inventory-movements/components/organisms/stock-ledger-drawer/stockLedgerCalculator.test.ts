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

  it("calculates ADJUSTMENT_CANCEL accurately as adjustment instead of issue", () => {
    const txs: StockTransactionRow[] = [
      {
        id: "tx-cancel",
        transactionDate: "2026-01-20T08:00:00Z",
        transactionType: "ADJUSTMENT_CANCEL",
        documentType: "ADJUSTMENT",
        documentId: "adj-cancel-1",
        qtyIn: 0,
        qtyOut: 2,
        unitCost: 150,
      },
      {
        id: "tx-init",
        transactionDate: "2026-01-01T08:00:00Z",
        transactionType: "RECEIPT",
        documentType: "PURCHASE_RECEIPT",
        documentId: "pr-1",
        qtyIn: 10,
        qtyOut: 0,
        unitCost: 100,
      },
    ];

    const result = calculateStockLedger(txs, "WEIGHTED_AVG");
    expect(result.rows).toHaveLength(2);
    const cancelRow = result.rows[0];
    expect(cancelRow.id).toBe("tx-cancel");
    expect(cancelRow.qtyAdjusted).toBe(-2);
    expect(cancelRow.qtyIn).toBe(0);
    expect(cancelRow.qtyOut).toBe(0);
    expect(cancelRow.balanceQty).toBe(8); // 10 - 2 = 8
    expect(result.totals.totalAdjustedQty).toBe(-2);
  });

  it("correctly preserves chronological order for same-day transactions with random UUIDs", () => {
    // Giả lập mảng DESC trả về từ Backend cho 6 giao dịch cùng ngày (như ảnh người dùng)
    // Thứ tự phát sinh thực tế: Nhập 10 -> Xuất 4 -> Hủy xuất 4 -> Hủy nhập 10 -> Điều chỉnh +2 -> Hủy điều chỉnh 2
    // Backend trả về DESC: Hủy điều chỉnh -> Điều chỉnh -> Hủy nhập -> Hủy xuất -> Xuất -> Nhập
    const sameDayTxsDesc: StockTransactionRow[] = [
      {
        id: "uuid-0002", // Giả lập UUID nhỏ hơn nhưng tạo sau
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T15:00:00Z",
        transactionType: "ADJUSTMENT_CANCEL",
        documentType: "ADJUSTMENT",
        documentId: "d6",
        qtyIn: 0,
        qtyOut: 2,
        unitCost: 150,
      },
      {
        id: "uuid-9999",
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T14:00:00Z",
        transactionType: "ADJUSTMENT",
        documentType: "ADJUSTMENT",
        documentId: "d5",
        qtyIn: 2,
        qtyOut: 0,
        unitCost: 150,
      },
      {
        id: "uuid-8888",
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T13:00:00Z",
        transactionType: "RECEIPT_CANCEL",
        documentType: "RECEIPT",
        documentId: "d4",
        qtyIn: 0,
        qtyOut: 10,
        unitCost: 100,
      },
      {
        id: "uuid-7777",
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T12:00:00Z",
        transactionType: "ISSUE_CANCEL",
        documentType: "ISSUE",
        documentId: "d3",
        qtyIn: 4,
        qtyOut: 0,
        unitCost: 100,
      },
      {
        id: "uuid-0001", // UUID nhỏ nhất nhưng tạo bước 2
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T11:00:00Z",
        transactionType: "ISSUE",
        documentType: "ISSUE",
        documentId: "d2",
        qtyIn: 0,
        qtyOut: 4,
        unitCost: 100,
      },
      {
        id: "uuid-5555",
        transactionDate: "2026-11-06T00:00:00Z",
        createdAt: "2026-11-06T10:00:00Z",
        transactionType: "RECEIPT",
        documentType: "PURCHASE_RECEIPT",
        documentId: "d1",
        qtyIn: 10,
        qtyOut: 0,
        unitCost: 100,
      },
    ];

    const result = calculateStockLedger(sameDayTxsDesc, "WEIGHTED_AVG");
    expect(result.rows).toHaveLength(6);

    // Mới nhất lên đầu (DESC): Hủy điều chỉnh -> Điều chỉnh -> Hủy nhập -> Hủy xuất -> Xuất -> Nhập
    // Kiểm tra dòng cũ nhất (dòng cuối cùng trong rows, index 5): Nhập kho 10 -> Tồn phải là 10 (không thể là 0 hay âm!)
    const firstTxDisplayed = result.rows[5];
    expect(firstTxDisplayed.id).toBe("uuid-5555");
    expect(firstTxDisplayed.balanceQty).toBe(10);

    // Dòng xuất kho 4 (index 4): Tồn = 10 - 4 = 6
    expect(result.rows[4].id).toBe("uuid-0001");
    expect(result.rows[4].balanceQty).toBe(6);

    // Dòng hủy xuất 4 (index 3): Tồn = 6 + 4 = 10
    expect(result.rows[3].id).toBe("uuid-7777");
    expect(result.rows[3].balanceQty).toBe(10);

    // Dòng hủy nhập 10 (index 2): Tồn = 10 - 10 = 0
    expect(result.rows[2].id).toBe("uuid-8888");
    expect(result.rows[2].balanceQty).toBe(0);

    // Dòng điều chỉnh +2 (index 1): Tồn = 0 + 2 = 2
    expect(result.rows[1].id).toBe("uuid-9999");
    expect(result.rows[1].balanceQty).toBe(2);

    // Dòng hủy điều chỉnh 2 (index 0, trên cùng): Tồn = 2 - 2 = 0
    expect(result.rows[0].id).toBe("uuid-0002");
    expect(result.rows[0].balanceQty).toBe(0);
    expect(result.totals.finalBalanceQty).toBe(0);
  });
});
