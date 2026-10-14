import { describe, expect, it } from "vitest";
import type { MonthClassificationRow } from "./MonthClassificationTable.type";

describe("MonthClassificationTable data contract", () => {
  it("keeps receivable and payable rows independent", () => {
    const receivableRows: MonthClassificationRow[] = [
      {
        key: "SUA_CHUA_CHUNG",
        name: "Sửa chữa chung",
        icon: null,
        caseCount: 2,
        billed: 100,
        paid: 40,
        remaining: 60,
        remainingWithInvoice: 20,
        remainingNoInvoice: 40,
        rate: 40,
        shareRate: 100,
      },
    ];
    const payableRows = receivableRows.map((row) => ({
      ...row,
      billed: 80,
      paid: 30,
      remaining: 50,
    }));

    expect(receivableRows[0].remaining).toBe(60);
    expect(payableRows[0].remaining).toBe(50);
  });
});
