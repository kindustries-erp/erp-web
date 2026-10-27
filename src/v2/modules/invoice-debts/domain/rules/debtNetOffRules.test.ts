import { describe, expect, it } from "vitest";
import {
  getAllocatableInvoices,
  remainingUnallocated,
  sumLinesCents,
  toCents,
  validateNetOffLines,
  type NetOffOpenInvoice,
} from "./debtNetOffRules";

const invoice = (
  id: string,
  balanceAmount: number,
  overrides: Partial<NetOffOpenInvoice> = {},
): NetOffOpenInvoice => ({
  id,
  invoiceNo: `HD-${id}`,
  invoiceDate: "2026-10-01",
  totalAmount: balanceAmount,
  balanceAmount,
  taxInvoiceStatus: 1,
  ...overrides,
});

describe("debtNetOffRules", () => {
  it("chuyển sang cent để tránh sai số số thực", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(
      sumLinesCents([
        { invoiceId: "a", amount: 0.1 },
        { invoiceId: "b", amount: 0.2 },
      ]),
    ).toBe(30);
  });

  it("loại hóa đơn hết số dư, số âm và hóa đơn điều chỉnh giảm", () => {
    const result = getAllocatableInvoices([
      invoice("ok", 100),
      invoice("paid", 0),
      invoice("negative", -50, { totalAmount: -50 }),
      invoice("adjust", 100, { taxInvoiceStatus: 3 }),
    ]);
    expect(result.map((item) => item.id)).toEqual(["ok"]);
  });

  it("tính số chưa phân bổ còn lại sau các dòng đang nhập", () => {
    expect(
      remainingUnallocated(1000, [
        { invoiceId: "a", amount: 300 },
        { invoiceId: "b", amount: 200.5 },
      ]),
    ).toBe(499.5);
  });

  it("báo lỗi khi không có dòng hoặc số tiền không dương", () => {
    expect(
      validateNetOffLines({ lines: [], invoices: [], unallocatedAmount: 100 }),
    ).toBe("empty");
    expect(
      validateNetOffLines({
        lines: [{ invoiceId: "a", amount: 0 }],
        invoices: [invoice("a", 100)],
        unallocatedAmount: 100,
      }),
    ).toBe("nonPositive");
  });

  it("báo lỗi khi vượt số dư hóa đơn hoặc vượt số chưa phân bổ", () => {
    const invoices = [invoice("a", 100), invoice("b", 100)];
    expect(
      validateNetOffLines({
        lines: [{ invoiceId: "a", amount: 101 }],
        invoices,
        unallocatedAmount: 500,
      }),
    ).toBe("overBalance");
    expect(
      validateNetOffLines({
        lines: [
          { invoiceId: "a", amount: 100 },
          { invoiceId: "b", amount: 100 },
        ],
        invoices,
        unallocatedAmount: 150,
      }),
    ).toBe("overUnallocated");
  });

  it("chấp nhận khi tổng bằng đúng số chưa phân bổ", () => {
    expect(
      validateNetOffLines({
        lines: [
          { invoiceId: "a", amount: 60.25 },
          { invoiceId: "b", amount: 39.75 },
        ],
        invoices: [invoice("a", 100), invoice("b", 100)],
        unallocatedAmount: 100,
      }),
    ).toBeNull();
  });
});
