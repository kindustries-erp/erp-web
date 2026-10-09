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

  it("searches each text column on its own, without a global search", () => {
    const target = rows[0]!;
    const byNo = queryInvoices(
      rows,
      query({
        columnSearch: { invoiceNo: target.invoiceNo },
        pageSize: 100,
      }),
      "all",
    );
    expect(byNo.items.length).toBeGreaterThan(0);
    expect(
      byNo.items.every((r) => r.invoiceNo.includes(target.invoiceNo)),
    ).toBe(true);

    const byPartner = queryInvoices(
      rows,
      query({ columnSearch: { partner: "An Phát" }, pageSize: 100 }),
      "all",
    );
    expect(byPartner.total).toBeGreaterThan(0);
    expect(
      queryInvoices(
        rows,
        query({ search: target.invoiceNo, pageSize: 100 }),
        "all",
      ).total,
    ).toBe(rows.length);
  });

  it("searches an amount column by its value", () => {
    const target = rows[0]!;
    const result = queryInvoices(
      rows,
      query({
        columnSearch: { total: String(target.total) },
        pageSize: 100,
      }),
      "all",
    );
    expect(result.items.some((r) => r.id === target.id)).toBe(true);
    expect(
      result.items.every((r) => String(r.total).includes(String(target.total))),
    ).toBe(true);
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

  it.each(["posting", "branchId", "partner"] as const)(
    "sorts text and select column %s in both directions",
    (columnKey) => {
      const run = (direction: TableSortState.ASC | TableSortState.DESC) =>
        queryInvoices(
          rows,
          query({ sorts: [{ columnKey, direction }], pageSize: 100 }),
          "all",
        ).items.map((r) => r[columnKey]);
      const asc = run(TableSortState.ASC);
      const desc = run(TableSortState.DESC);
      expect(asc).toEqual(
        [...asc].sort((a, b) =>
          a.localeCompare(b, "vi", { numeric: true, sensitivity: "base" }),
        ),
      );
      expect(desc).toEqual([...asc].reverse());
    },
  );

  it("sorts the derived remaining amount column", () => {
    const result = queryInvoices(
      rows,
      query({
        sorts: [{ columnKey: "remaining", direction: TableSortState.DESC }],
        pageSize: 100,
      }),
      "all",
    );
    const remaining = result.items.map((r) => r.total - r.paid);
    expect(remaining).toEqual([...remaining].sort((a, b) => b - a));
  });

  it("filters the derived remaining column by its search", () => {
    const target = rows[0]!;
    const value = String(target.total - target.paid);
    const result = queryInvoices(
      rows,
      query({ columnSearch: { remaining: value }, pageSize: 100 }),
      "all",
    );
    expect(result.items.some((r) => r.id === target.id)).toBe(true);
  });
});
