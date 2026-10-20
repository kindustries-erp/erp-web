import { describe, it, expect } from "vitest";
import {
  calculatePercentage,
  buildReceivablesTreeItems,
  buildCostTreeItems,
} from "./FinancialTree.helper";

const mockT = ((k: string, opts?: any) => {
  if (typeof opts === "string") return opts;
  if (opts && typeof opts === "object" && opts.defaultValue) {
    return opts.defaultValue;
  }
  return k;
}) as any;

describe("FinancialTree.helper", () => {
  describe("calculatePercentage", () => {
    it("returns 0 if target is zero or negative", () => {
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(100, -50)).toBe(0);
    });

    it("calculates percentage accurately rounded to 1 decimal", () => {
      expect(calculatePercentage(500, 1000)).toBe(50);
      expect(calculatePercentage(1000000, 1296000)).toBe(77.2);
      expect(calculatePercentage(296000, 1296000)).toBe(22.8);
    });
  });

  describe("buildReceivablesTreeItems", () => {
    it("builds 1 parent target row and child rows for invoices and settlements", () => {
      const caseData = {
        tienCoThue: 1296000,
        tienThanhToanKh: 1296000,
        tienThanhToanBh: 0,
      };

      const activeLinkedInvoices = [
        {
          id: "inv-1",
          direction: "OUT",
          invoiceNo: "375",
          totalAmount: 1000000,
          invoiceDate: "2026-10-02",
          buyerName: "Công ty ABC",
          isPending: true,
        },
      ];

      const activeSettlements = [
        {
          id: "set-1",
          settlementType: "RECEIPT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          amount: 296000,
          transDate: "2026-10-03",
          partnerName: "Khách lẻ",
          isPending: false,
        },
      ];

      const rows = buildReceivablesTreeItems(
        caseData,
        activeSettlements,
        activeLinkedInvoices,
        mockT,
      );

      // Parent row + 1 invoice + 1 settlement = 3 rows
      expect(rows).toHaveLength(3);

      const parent = rows[0];
      expect(parent.rowType).toBe("PARENT_TARGET");
      expect(parent.amount).toBe(1296000);
      expect(parent.settledAmount).toBe(296000);
      expect(parent.remainingAmount).toBe(1000000);
      expect(parent.percentOfTotal).toBe(100);

      const invRow = rows[1];
      expect(invRow.rowType).toBe("CHILD_ITEM");
      expect(invRow.iconType).toBe("INVOICE");
      expect(invRow.amount).toBe(1000000);
      expect(invRow.percentOfTotal).toBe(77.2);
      expect(invRow.isPending).toBe(true);

      const setRow = rows[2];
      expect(setRow.rowType).toBe("CHILD_ITEM");
      expect(setRow.iconType).toBe("CASH");
      expect(setRow.amount).toBe(296000);
      expect(setRow.percentOfTotal).toBe(22.8);
      expect(setRow.isPending).toBe(false);
    });

    it("displays insurance allocation subtitle when tienThanhToanBh > 0", () => {
      const caseData = {
        tienCoThue: 10000000,
        tienThanhToanKh: 2000000,
        tienThanhToanBh: 8000000,
      };

      const rows = buildReceivablesTreeItems(caseData, [], [], mockT);
      expect(rows[0].subTitle).toContain("2.000.000");
      expect(rows[0].subTitle).toContain("8.000.000");
    });
  });

  describe("buildCostTreeItems", () => {
    it("builds 1 parent cost row and child rows", () => {
      const totalCostAmount = 1200000;
      const activeLinkedInvoices = [
        {
          id: "inv-in-1",
          direction: "IN",
          invoiceNo: "1122",
          totalAmount: 500000,
          invoiceDate: "2026-10-01",
          sellerName: "Nhà cung cấp XYZ",
        },
      ];
      const activeSettlements = [
        {
          id: "set-cost-1",
          settlementType: "PAYMENT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          amount: 700000,
          transDate: "2026-10-02",
          partnerName: "Thợ gia công",
        },
      ];

      const rows = buildCostTreeItems(
        totalCostAmount,
        activeSettlements,
        activeLinkedInvoices,
        mockT,
      );

      expect(rows).toHaveLength(3);
      expect(rows[0].rowType).toBe("PARENT_TARGET");
      expect(rows[0].amount).toBe(1200000);
      expect(rows[0].settledAmount).toBe(700000);
      expect(rows[0].remainingAmount).toBe(500000);

      expect(rows[1].amount).toBe(500000);
      expect(rows[1].percentOfTotal).toBe(41.7);

      expect(rows[2].amount).toBe(700000);
      expect(rows[2].percentOfTotal).toBe(58.3);
    });
  });
});
