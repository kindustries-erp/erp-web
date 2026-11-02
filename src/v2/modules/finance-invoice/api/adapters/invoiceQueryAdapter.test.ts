import { describe, expect, it } from "vitest";
import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";
import { toSortParam, v2InvoiceQueryToParams } from "./invoiceQueryAdapter";

const baseQuery: V2TableQuery = {
  page: 2,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

describe("toSortParam", () => {
  it("encodes descending sorts with a leading dash", () => {
    expect(
      toSortParam([
        { columnKey: "invoiceDate", direction: TableSortState.DESC },
        { columnKey: "invoiceNo", direction: TableSortState.ASC },
      ]),
    ).toBe("-invoiceDate,invoiceNo");
  });

  it("returns undefined when no sort is set", () => {
    expect(toSortParam([])).toBeUndefined();
  });
});

describe("v2InvoiceQueryToParams", () => {
  it("sends the sort as one v2 sort param, not the v1 sort_by pair", () => {
    const params = v2InvoiceQueryToParams("IN", "all", {
      ...baseQuery,
      sorts: [{ columnKey: "totalAmount", direction: TableSortState.DESC }],
    });
    expect(params.sort).toBe("-totalAmount");
    expect(params).not.toHaveProperty("sort_by");
    expect(params).not.toHaveProperty("sort_order");
  });

  it("sends the invoice date range as YYYY-MM-DD", () => {
    const params = v2InvoiceQueryToParams("OUT", "all", {
      ...baseQuery,
      dateRanges: { invoiceDate: { from: "2026-10-01", to: "2026-10-31" } },
    });
    expect(params.date_from).toBe("2026-10-01");
    expect(params.date_to).toBe("2026-10-31");
  });

  it("adds the tax tab statuses to the column filters", () => {
    const params = v2InvoiceQueryToParams("IN", "adjustment", baseQuery);
    expect(JSON.parse(params.column_filters ?? "{}")).toEqual({
      taxInvoiceStatus: ["3", "5"],
    });
  });
});
