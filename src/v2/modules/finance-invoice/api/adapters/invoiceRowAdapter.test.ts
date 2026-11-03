import { describe, expect, it } from "vitest";
import { toInvoiceRow, toInvoiceSummary } from "./invoiceRowAdapter";

describe("toInvoiceRow", () => {
  it("uses the seller for IN invoices and the buyer for OUT invoices", () => {
    const row = {
      id: "1",
      invoiceNo: "00001",
      sellerName: "Seller",
      buyerName: "Buyer",
      invoiceDate: "2026-10-23T00:00:00",
    };
    expect(toInvoiceRow(row, "IN")).toMatchObject({
      partner: "Seller",
      invoiceDate: "2026-10-23",
    });
    expect(toInvoiceRow(row, "OUT")).toMatchObject({ partner: "Buyer" });
  });

  it("converts decimal string amounts into numbers", () => {
    const row = toInvoiceRow(
      {
        id: "1",
        preVatAmount: "1000.50",
        vatAmount: "100.05",
        totalAmount: "1100.55",
      },
      "IN",
    );
    expect(row.preVat).toBe(1000.5);
    expect(row.vat).toBe(100.05);
    expect(row.total).toBe(1100.55);
    expect(row.totalAmount).toBe(1100.55);
  });

  it("maps POSTED status and falls back to 0 for missing amounts", () => {
    const row = toInvoiceRow(
      { id: "1", postingStatus: "POSTED", totalAmount: null },
      "IN",
    );
    expect(row.posting).toBe("POSTED");
    expect(row.total).toBe(0);
  });
});

describe("toInvoiceSummary", () => {
  it("keeps the v2 summary keys for the amount columns", () => {
    const summary = toInvoiceSummary({
      preVatAmount: 10,
      vatAmount: 1,
      totalAmount: 11,
      discountAmount: 0,
      netOffAmount: 5,
      remainingAmount: 6,
    });
    expect(summary).toEqual({
      preVatAmount: 10,
      vatAmount: 1,
      totalAmount: 11,
      discountAmount: 0,
      netOffAmount: 5,
      remainingAmount: 6,
    });
  });

  it("returns zeros when summaries are missing", () => {
    expect(toInvoiceSummary(undefined).totalAmount).toBe(0);
  });
});
