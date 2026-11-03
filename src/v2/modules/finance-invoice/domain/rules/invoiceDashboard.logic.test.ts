import { describe, expect, it } from "vitest";
import {
  buildInvoiceDashboard,
  toMillion,
  toPartnerShare,
} from "./invoiceDashboard.logic";

const partner = (name: string, out: number) => ({
  taxCode: name,
  partnerName: name,
  totalInAmount: 0,
  totalOutAmount: out,
  payableAmount: 0,
  receivableAmount: 0,
});

describe("buildInvoiceDashboard", () => {
  it("derives KPIs from pre-VAT and total amounts", () => {
    const view = buildInvoiceDashboard({
      out: { monthTotal: 1_100, monthPreVat: 1_000 },
      in: { monthTotal: 550, monthPreVat: 500 },
      trend: [],
      partners: [],
    });
    expect(view.kpis).toEqual({
      sales: 1_000,
      purchases: 500,
      vatOut: 100,
      vatNet: 50,
    });
  });

  it("builds cash and VAT series aligned with the trend labels", () => {
    const view = buildInvoiceDashboard({
      out: { monthTotal: 0, monthPreVat: 0 },
      in: { monthTotal: 0, monthPreVat: 0 },
      trend: [
        { label: "2026-01", cashIn: 1, cashOut: 2, vatIn: 3, vatOut: 4 },
        { label: "2026-02", cashIn: 5, cashOut: 6 },
      ],
      partners: [],
    });
    expect(view.labels).toEqual(["2026-01", "2026-02"]);
    expect(view.cashSeries.map((s) => s.data)).toEqual([
      [1, 5],
      [2, 6],
    ]);
    expect(view.vatSeries.map((s) => s.data)).toEqual([
      [3, 0],
      [4, 0],
    ]);
  });
});

describe("toPartnerShare", () => {
  it("keeps the top partners by outgoing amount with their share", () => {
    const result = toPartnerShare([
      partner("A", 100),
      partner("B", 300),
      partner("C", 600),
    ]);
    expect(result.labels).toEqual(["C", "B", "A"]);
    expect(result.share).toEqual([60, 30, 10]);
  });

  it("returns zero shares when nothing was sold", () => {
    expect(toPartnerShare([partner("A", 0)]).share).toEqual([0]);
  });
});

describe("toMillion", () => {
  it("converts VND to whole millions", () => {
    expect(toMillion(3_390_400_000)).toBe(3_390);
  });
});
