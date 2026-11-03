import { describe, it, expect } from "vitest";
import { buildFlatLedgerRows } from "./fifoTransform";
import type { LedgerRow } from "./useFifoUnitLedger";

const base = (overrides: Partial<LedgerRow>): LedgerRow => ({
  id: "x",
  direction: "IN",
  qty: "1",
  unitCost: "100",
  preVatAmount: "100",
  transactionDate: "2026-01-01",
  isAdjustment: false,
  adjSign: 1,
  invoiceId: "inv",
  invoiceNo: "INV",
  invoiceDate: "2026-01-01",
  buyerName: "",
  sellerName: "NCC",
  licensePlate: "",
  ...overrides,
});

describe("buildFlatLedgerRows", () => {
  it("uses balance values from the API and keeps its order", () => {
    const rows = buildFlatLedgerRows([
      base({ id: "in-1", qty: "2", balanceQty: 2, balanceValue: 200 }),
      base({
        id: "out-1",
        direction: "OUT",
        qty: "1",
        preVatAmount: "150",
        calculatedCogs: 100,
        calculatedUnitCost: 100,
        balanceQty: 1,
        balanceValue: 100,
        shortageQty: 0,
      }),
    ]);

    expect(rows.map((r) => r.id)).toEqual(["in-1", "out-1"]);
    expect(rows[1].balanceQty).toBe(1);
    expect(rows[1].balanceValue).toBe(100);
    expect(rows[1].outCogs).toBe(100);
  });

  it("does not clamp a negative balance when a sale exceeds stock", () => {
    const [, out] = buildFlatLedgerRows([
      base({ id: "in-1", qty: "1", balanceQty: 1, balanceValue: 100 }),
      base({
        id: "out-1",
        direction: "OUT",
        qty: "3",
        preVatAmount: "450",
        calculatedCogs: 100,
        calculatedUnitCost: 100,
        balanceQty: -2,
        balanceValue: 0,
        shortageQty: 2,
      }),
    ]);

    expect(out.balanceQty).toBe(-2);
    expect(out.shortageDelta).toBe(2);
    expect(out.isReturn).toBe(false);
  });

  it("flags a return row and reports no shortage on it", () => {
    const [, , ret] = buildFlatLedgerRows([
      base({ id: "in-1", qty: "2", balanceQty: 2, balanceValue: 200 }),
      base({
        id: "out-1",
        direction: "OUT",
        qty: "2",
        preVatAmount: "300",
        calculatedCogs: 200,
        calculatedUnitCost: 100,
        balanceQty: 0,
        balanceValue: 0,
        shortageQty: 0,
      }),
      base({
        id: "ret-1",
        direction: "OUT",
        qty: "1",
        isAdjustment: true,
        adjSign: -1,
        preVatAmount: "150",
        calculatedCogs: -100,
        calculatedUnitCost: 100,
        balanceQty: 1,
        balanceValue: 100,
        shortageQty: 0,
      }),
    ]);

    expect(ret.isReturn).toBe(true);
    expect(ret.outQty).toBe(-1);
    expect(ret.shortageDelta).toBe(0);
    expect(ret.balanceQty).toBe(1);
  });

  it("reports shortage only on the row where it first appears", () => {
    const rows = buildFlatLedgerRows([
      base({
        id: "in-1",
        qty: "1",
        balanceQty: 1,
        balanceValue: 100,
        shortageQty: 0,
      }),
      base({
        id: "out-1",
        direction: "OUT",
        qty: "2",
        calculatedCogs: 100,
        balanceQty: -1,
        balanceValue: 0,
        shortageQty: 1,
      }),
      base({
        id: "out-2",
        direction: "OUT",
        qty: "1",
        calculatedCogs: 0,
        balanceQty: -2,
        balanceValue: 0,
        shortageQty: 2,
      }),
    ]);

    expect(rows[1].shortageDelta).toBe(1);
    expect(rows[2].shortageDelta).toBe(1);
  });
});
