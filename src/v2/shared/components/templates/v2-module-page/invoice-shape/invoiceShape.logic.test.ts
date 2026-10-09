import { describe, expect, it } from "vitest";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { TableSortState } from "@/v2/shared/types/v2-table";
import { makeInvoices } from "./invoiceShape.data";
import { queryInvoices } from "./invoiceShape.logic";

const rows = makeInvoices("IN");
const query = (patch: Partial<V2TableQuery> = {}): V2TableQuery => ({
  page: 1,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
  ...patch,
});

describe("invoice-shape fake logic", () => {
  it("generates deterministic data", () => {
    expect(makeInvoices("IN")).toEqual(rows);
    expect(rows).toHaveLength(60);
  });

  it("paginates and reports the grand total across pages", () => {
    const page2 = queryInvoices(rows, query({ page: 2, pageSize: 20 }), "all");
    expect(page2.items).toHaveLength(20);
    expect(page2.total).toBe(60);
    expect(page2.summaries.total).toBe(rows.reduce((s, r) => s + r.total, 0));
  });

  it("filters by tax tab", () => {
    const result = queryInvoices(rows, query({ pageSize: 100 }), "replacement");
    expect(result.items.every((r) => r.taxTab === "replacement")).toBe(true);
    expect(result.total).toBeLessThan(60);
  });

  it("searches across invoice number, partner and tax code without diacritics", () => {
    expect(
      queryInvoices(rows, query({ search: "an phat" }), "all").total,
    ).toBeGreaterThan(0);
    expect(
      queryInvoices(rows, query({ search: "0301234567" }), "all").total,
    ).toBeGreaterThan(0);
    expect(
      queryInvoices(rows, query({ search: "khong co" }), "all").total,
    ).toBe(0);
  });

  it("filters by column values and date range", () => {
    const posted = queryInvoices(
      rows,
      query({ columnFilters: { posting: ["POSTED"] }, pageSize: 100 }),
      "all",
    );
    expect(posted.items.every((r) => r.posting === "POSTED")).toBe(true);
    const ranged = queryInvoices(
      rows,
      query({
        dateRanges: { invoiceDate: { from: "2026-03-01", to: "2026-03-31" } },
        pageSize: 100,
      }),
      "all",
    );
    expect(ranged.items.every((r) => r.invoiceDate.startsWith("2026-03"))).toBe(
      true,
    );
  });

  it("sorts by the primary sort", () => {
    const asc = queryInvoices(
      rows,
      query({
        sorts: [{ columnKey: "total", direction: TableSortState.ASC }],
        pageSize: 100,
      }),
      "all",
    );
    const totals = asc.items.map((r) => r.total);
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
  });
});
