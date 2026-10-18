import { describe, expect, it } from "vitest";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import {
  flattenReceivablesGroupsToCases,
  calculateCasesTotals,
} from "./MonthInvoiceCaseRow.helper";

describe("MonthInvoiceCaseRow.helper", () => {
  const mockGroups: MonthlyReceivablesGroupItem[] = [
    {
      key: "INS_PVI",
      payerType: "BH",
      title: "Bảo hiểm PVI",
      buyerName: "Bảo hiểm PVI",
      taxCode: "0100115732",
      hasInvoice: true,
      invoiceNos: ["001234"],
      hasVat: true,
      vatAmount: 200000,
      vatWarning: false,
      caseCount: 2,
      billed: 5000000,
      paid: 3000000,
      remaining: 2000000,
      rate: 60,
      shareRate: 50,
      cases: [
        {
          id: "case-1",
          soChungTu: "GR-PDV2610-0001",
          bienSoXe: "79C-223.82",
          khachHangName: "Nguyễn Văn A",
          amount: 3000000,
          paid: 2000000,
          remaining: 1000000,
          vatAmount: 100000,
          invoiceNo: "001234",
          vatWarning: false,
        },
        {
          id: "case-2",
          soChungTu: "GR-PDV2610-0002",
          bienSoXe: "51K-999.99",
          khachHangName: "Trần Thị B",
          amount: 2000000,
          paid: 1000000,
          remaining: 1000000,
          vatAmount: 100000,
          invoiceNo: "001234",
          vatWarning: false,
        },
      ],
    },
    {
      key: "ENT_KIM_CUONG",
      payerType: "KH",
      title: "Công ty TNHH Kim Cương",
      buyerName: "Công ty TNHH Kim Cương",
      taxCode: "0312345678",
      hasInvoice: false,
      invoiceNos: [],
      hasVat: true,
      vatAmount: 500000,
      vatWarning: true,
      caseCount: 1,
      billed: 5000000,
      paid: 0,
      remaining: 5000000,
      rate: 0,
      shareRate: 50,
      cases: [
        {
          id: "case-3",
          soChungTu: "GR-PDV2610-0003",
          bienSoXe: "79C-223.82",
          khachHangName: "Công ty Kim Cương",
          amount: 5000000,
          paid: 0,
          remaining: 5000000,
          vatAmount: 500000,
          vatWarning: true,
        },
      ],
    },
  ];

  it("flattens groups into individual case rows with license plates", () => {
    const rows = flattenReceivablesGroupsToCases(mockGroups, 10000000);
    expect(rows).toHaveLength(3);

    // Case 1
    expect(rows[0].soChungTu).toBe("GR-PDV2610-0001");
    expect(rows[0].bienSoXe).toBe("79C-223.82");
    expect(rows[0].partnerTitle).toBe("Bảo hiểm PVI");
    expect(rows[0].payerType).toBe("BH");
    expect(rows[0].hasInvoice).toBe(true);
    expect(rows[0].invoiceNo).toBe("001234");
    expect(rows[0].billed).toBe(3000000);
    expect(rows[0].shareRate).toBe(30);

    // Case 3 (vatWarning)
    expect(rows[2].soChungTu).toBe("GR-PDV2610-0003");
    expect(rows[2].vatWarning).toBe(true);
    expect(rows[2].hasInvoice).toBe(false);
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(flattenReceivablesGroupsToCases([])).toEqual([]);
    expect(flattenReceivablesGroupsToCases(null as any)).toEqual([]);
  });

  it("handles fallback when group has no cases array", () => {
    const fallbackGroups: MonthlyReceivablesGroupItem[] = [
      {
        key: "GRP_FALLBACK",
        payerType: "KH",
        title: "Khách lẻ không có chi tiết",
        buyerName: "Khách lẻ",
        hasInvoice: false,
        invoiceNos: [],
        hasVat: false,
        vatAmount: 0,
        vatWarning: false,
        caseCount: 1,
        billed: 1000000,
        paid: 500000,
        remaining: 500000,
        rate: 50,
        shareRate: 10,
        cases: [],
      },
    ];

    const rows = flattenReceivablesGroupsToCases(fallbackGroups, 10000000);
    expect(rows).toHaveLength(1);
    expect(rows[0].soChungTu).toBe("Khách lẻ không có chi tiết");
    expect(rows[0].billed).toBe(1000000);
  });

  it("calculates summary totals correctly including unique vehicle count", () => {
    const rows = flattenReceivablesGroupsToCases(mockGroups, 10000000);
    const totals = calculateCasesTotals(rows);

    expect(totals.caseCount).toBe(3);
    // 79C-223.82 appears in case-1 and case-3, 51K-999.99 in case-2 => 2 unique vehicles
    expect(totals.vehicleCount).toBe(2);
    expect(totals.billed).toBe(10000000);
    expect(totals.paid).toBe(3000000);
    expect(totals.remaining).toBe(7000000);
  });

  it("maps cost, paidCost, remainingCost when debtType is payables", () => {
    const payablesGroups: MonthlyReceivablesGroupItem[] = [
      {
        ...mockGroups[0],
        cost: 2000000,
        paidCost: 1500000,
        remainingCost: 500000,
        cases: [
          {
            ...mockGroups[0].cases[0],
            cost: 1500000,
            paidCost: 1000000,
            remainingCost: 500000,
          },
        ],
      },
    ];

    const rows = flattenReceivablesGroupsToCases(
      payablesGroups,
      5000000,
      "payables",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].billed).toBe(1500000);
    expect(rows[0].paid).toBe(1000000);
    expect(rows[0].remaining).toBe(500000);
    expect(rows[0].shareRate).toBe(30);
  });
});
