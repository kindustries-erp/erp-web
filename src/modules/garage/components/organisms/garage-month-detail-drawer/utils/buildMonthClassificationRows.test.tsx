import { describe, it, expect } from "vitest";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { buildMonthClassificationRows } from "./buildMonthClassificationRows";

function trend(overrides: Partial<GarageTrendItem>): GarageTrendItem {
  return {
    label: "x",
    tienCoThue: 0,
    cost: 0,
    ...overrides,
  } as GarageTrendItem;
}

describe("buildMonthClassificationRows: còn phải thu", () => {
  it("phải thu cộng theo từng phiếu: nhóm thu dư vẫn giữ phần phiếu còn nợ", () => {
    const rows = buildMonthClassificationRows(
      trend({
        tienCoThue: 234729184,
        billedSuaChuaChung: 234729184,
        paidSuaChuaChung: 257966184,
        caseCountSuaChuaChung: 27,
        receivableWithInvoiceSuaChuaChung: 540000,
        receivableNoInvoiceSuaChuaChung: 0,
      } as Partial<GarageTrendItem>),
      "receivables",
    );
    const scc = rows.find((r) => r.key === "SUA_CHUA_CHUNG");
    expect(scc?.remaining).toBe(540000);
    expect(scc?.remainingWithInvoice).toBe(540000);
    expect(scc?.remainingNoInvoice).toBe(0);
  });

  it("thiếu field theo phiếu thì rơi về phát sinh − đã thu của nhóm", () => {
    const rows = buildMonthClassificationRows(
      trend({
        tienCoThue: 1000,
        billedKyGuiNoiBo: 1000,
        paidKyGuiNoiBo: 400,
        caseCountKyGuiNoiBo: 1,
      } as Partial<GarageTrendItem>),
      "receivables",
    );
    expect(rows.find((r) => r.key === "KY_GUI_NOI_BO")?.remaining).toBe(600);
  });

  it("phải trả vẫn tính phát sinh − đã trả của nhóm", () => {
    const rows = buildMonthClassificationRows(
      trend({
        cost: 1000,
        costSuaChuaChung: 1000,
        paidCostSuaChuaChung: 300,
        caseCountSuaChuaChung: 1,
      } as Partial<GarageTrendItem>),
      "payables",
    );
    expect(rows.find((r) => r.key === "SUA_CHUA_CHUNG")?.remaining).toBe(700);
  });
});
