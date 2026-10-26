import { describe, expect, it } from "vitest";
import { buildInvoiceDebtsColumns } from "./InvoiceDebtTable.columns";
import { invoiceDebtsViewVisibility } from "./InvoiceDebtTable.views";

const columns = buildInvoiceDebtsColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

describe("buildInvoiceDebtsColumns", () => {
  it("leaves the row number to V2StandardTable", () => {
    expect(columns.map((column) => column.key)).not.toContain("index");
  });

  it("keeps every field as a column in the same order", () => {
    expect(columns.map((column) => column.key)).toEqual([
      "search",
      "partnerType",
      "createdAt",
    ]);
  });
});

describe("invoiceDebtsViewVisibility", () => {
  it("shows all columns in the all view", () => {
    expect(Object.values(invoiceDebtsViewVisibility.all).every(Boolean)).toBe(
      true,
    );
  });
});
