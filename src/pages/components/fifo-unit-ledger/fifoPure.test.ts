import { describe, it, expect } from "vitest";
import type { LedgerDisplayRow } from "./fifoTransform";
import { filterRowsExcluding, formatFilterValue } from "./fifoFilters";
import { buildOptionsMap } from "./fifoOptions";
import { sortRows } from "./fifoSort";
import { computeTotals } from "./fifoTotals";

const row = (overrides: Partial<LedgerDisplayRow>): LedgerDisplayRow => ({
  id: "r",
  transactionDate: "2026-06-01T12:00:00",
  invoiceNo: "HD-1",
  invoiceId: "inv",
  partnerName: "KHACH",
  direction: "OUT",
  isReturn: false,
  shortageDelta: 0,
  balanceQty: 0,
  balanceValue: 0,
  ...overrides,
});

const rows = [
  row({
    id: "a",
    invoiceNo: "HD-A",
    transactionDate: "2026-06-01T12:00:00",
    balanceQty: 5,
    outQty: 2,
    outCogs: 200,
  }),
  row({
    id: "b",
    invoiceNo: "HD-B",
    transactionDate: "2026-06-10T12:00:00",
    balanceQty: -1,
    outQty: 6,
    outCogs: 600,
  }),
  row({
    id: "c",
    invoiceNo: "HD-C",
    transactionDate: "2026-06-20T12:00:00",
    balanceQty: 3,
    outQty: 1,
    outCogs: 100,
  }),
];

describe("filterRowsExcluding", () => {
  it("keeps rows inside the date range (from|to)", () => {
    const result = filterRowsExcluding(
      rows,
      { transactionDate: "2026-06-05|2026-06-15" },
      {},
      "",
    );
    expect(result.map((r) => r.id)).toEqual(["b"]);
  });

  it("applies text search case-insensitively", () => {
    const result = filterRowsExcluding(rows, { invoiceNo: "hd-c" }, {}, "");
    expect(result.map((r) => r.id)).toEqual(["c"]);
  });

  it("ignores its own column when computing that column's options", () => {
    const result = filterRowsExcluding(
      rows,
      {},
      { invoiceNo: ["HD-A"] },
      "invoiceNo",
    );
    expect(result.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("filters numeric columns by the formatted value shown to the user", () => {
    expect(formatFilterValue("balanceQty", -1)).toBe("-1");
    const result = filterRowsExcluding(rows, {}, { balanceQty: ["-1"] }, "");
    expect(result.map((r) => r.id)).toEqual(["b"]);
  });
});

describe("buildOptionsMap", () => {
  it("sorts text options and numeric options ascending", () => {
    const map = buildOptionsMap((col) =>
      filterRowsExcluding(rows, {}, {}, col),
    );
    expect(map.invoiceNo.map((o) => o.value)).toEqual(["HD-A", "HD-B", "HD-C"]);
    expect(map.balanceQty.map((o) => o.value)).toEqual(["-1", "3", "5"]);
  });
});

describe("sortRows", () => {
  it("sorts numeric columns descending with a leading minus", () => {
    const sorted = sortRows([...rows], ["-outQty"]);
    expect(sorted.map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("returns rows untouched when there is no sort", () => {
    const input = [...rows];
    expect(sortRows(input, [])).toBe(input);
  });
});

describe("computeTotals", () => {
  it("takes stock balance from the first row when unsorted", () => {
    const totals = computeTotals(rows, []);
    expect(totals.balanceQty).toBe(5);
    expect(totals.outQty).toBe(9);
    expect(totals.outValue).toBe(900);
  });

  it("takes stock balance from the latest date when sorted", () => {
    const totals = computeTotals(rows, ["outQty"]);
    expect(totals.balanceQty).toBe(3);
  });
});
