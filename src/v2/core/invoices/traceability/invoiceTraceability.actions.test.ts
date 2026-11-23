import { describe, expect, it } from "vitest";
import {
  resolveInvoiceAddLink,
  toPendingDocumentChange,
} from "./invoiceTraceability.actions";

describe("resolveInvoiceAddLink", () => {
  it.each([
    [undefined, "BANK_TXN", "OPEN_NETOFF"],
    ["PAYMENT", undefined, "OPEN_NETOFF"],
    [undefined, "PURCHASE_ORDER", "OPEN_PO"],
    ["ORDER_STOCK", undefined, "OPEN_PO"],
    [undefined, "SALES_ORDER", "OPEN_SO"],
    [undefined, "GARAGE_CASE", "OPEN_GARAGE_CASE"],
    [undefined, undefined, "OPEN_NETOFF"],
  ])("%s / %s → %s", (stage, doc, expected) => {
    expect(resolveInvoiceAddLink(stage, doc as never)).toBe(expected);
  });
});

describe("toPendingDocumentChange", () => {
  it.each([
    ["BANK_TXN", "BANK"],
    ["PURCHASE_ORDER", "PO"],
    ["GARAGE_CASE", "CASE"],
    ["SALES_ORDER", "SO"],
  ])("%s → %s", (docType, type) => {
    expect(
      toPendingDocumentChange({ id: "x", docType: docType as never }),
    ).toEqual({ type, action: "REMOVE", refId: "x" });
  });
  it("null với loại không gỡ được", () => {
    expect(toPendingDocumentChange({ id: "x", docType: "INVOICE" })).toBeNull();
  });
});
