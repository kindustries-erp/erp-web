import React from "react";
import { Wrench, Building2, ExternalLink, HelpCircle } from "lucide-react";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import type {
  MonthClassificationRow,
  MonthDebtType,
} from "../components/MonthClassificationTable.type";

export function buildMonthClassificationRows(
  item: GarageTrendItem,
  debtType: MonthDebtType,
): MonthClassificationRow[] {
  const isReceivable = debtType === "receivables";
  const value = (
    receivableKey: keyof GarageTrendItem,
    payableKey: keyof GarageTrendItem,
  ) => Number(item[isReceivable ? receivableKey : payableKey] ?? 0);
  const billed = (
    key: keyof GarageTrendItem,
    payableKey: keyof GarageTrendItem,
  ) => value(key, payableKey);
  const total = isReceivable
    ? Number(item.tienCoThue ?? 0)
    : Number(item.cost ?? 0);

  const definitions = [
    {
      key: "SUA_CHUA_CHUNG",
      name: "Sửa chữa chung",
      subLabel: "Bảo dưỡng định kỳ, sửa chữa tổng quát",
      icon: (
        <Wrench className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      ),
      billed: billed("billedSuaChuaChung", "costSuaChuaChung"),
      paid: billed("paidSuaChuaChung", "paidCostSuaChuaChung"),
      rate: billed("rateSuaChuaChung", "costRateSuaChuaChung"),
      caseCount: Number(item.caseCountSuaChuaChung ?? 0),
      withInvoice: value(
        "receivableWithInvoiceSuaChuaChung",
        "payableCostWithInvoiceSuaChuaChung",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceSuaChuaChung",
        "payableCostNoInvoiceSuaChuaChung",
      ),
    },
    {
      key: "KY_GUI_NOI_BO",
      name: "Ký gửi / Nội bộ",
      subLabel: "Xe công ty, nội bộ hoặc nhận ký gửi",
      icon: (
        <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
      ),
      billed: billed("billedKyGuiNoiBo", "costKyGuiNoiBo"),
      paid: billed("paidKyGuiNoiBo", "paidCostKyGuiNoiBo"),
      rate: billed("rateKyGuiNoiBo", "costRateKyGuiNoiBo"),
      caseCount: Number(item.caseCountKyGuiNoiBo ?? 0),
      withInvoice: value(
        "receivableWithInvoiceKyGuiNoiBo",
        "payableCostWithInvoiceKyGuiNoiBo",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceKyGuiNoiBo",
        "payableCostNoInvoiceKyGuiNoiBo",
      ),
    },
    {
      key: "OJ_NGOAI",
      name: "OJ / Ngoài hệ thống",
      subLabel: "Gia công hoặc ghi nhận ngoài",
      icon: (
        <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      ),
      billed: billed("billedOj", "costOj"),
      paid: billed("paidOj", "paidCostOj"),
      rate: billed("rateOj", "costRateOj"),
      caseCount: Number(item.caseCountOj ?? 0),
      withInvoice: value("receivableWithInvoiceOj", "payableCostWithInvoiceOj"),
      withoutInvoice: value("receivableNoInvoiceOj", "payableCostNoInvoiceOj"),
    },
    {
      key: "OTHER",
      name: "Khác / Chưa phân loại",
      subLabel: "Chưa gắn mã phân loại",
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
      billed: billed("billedOther", "costOther"),
      paid: billed("paidOther", "paidCostOther"),
      rate: billed("rateOther", "costRateOther"),
      caseCount: Number(item.caseCountOther ?? 0),
      withInvoice: value(
        "receivableWithInvoiceOther",
        "payableCostWithInvoiceOther",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceOther",
        "payableCostNoInvoiceOther",
      ),
    },
  ];

  return definitions
    .filter((row) => row.billed > 0 || row.caseCount > 0)
    .map((row) => {
      const remaining = Math.max(0, row.billed - row.paid);
      // Ràng buộc kế toán: remainingWithInvoice + remainingNoInvoice luôn bằng remaining
      let remainingWithInvoice = 0;
      let remainingNoInvoice = 0;

      if (remaining > 0) {
        if (row.withInvoice > 0 && row.withoutInvoice > 0) {
          const sumInv = row.withInvoice + row.withoutInvoice;
          remainingWithInvoice = Math.round(
            (row.withInvoice / sumInv) * remaining,
          );
          remainingNoInvoice = Math.max(0, remaining - remainingWithInvoice);
        } else if (row.withInvoice > 0) {
          remainingWithInvoice = remaining;
          remainingNoInvoice = 0;
        } else if (row.withoutInvoice > 0) {
          remainingWithInvoice = 0;
          remainingNoInvoice = remaining;
        } else {
          // Mặc định nếu cả hai đều bằng 0 nhưng còn nợ
          remainingNoInvoice = remaining;
        }
      }

      return {
        ...row,
        remaining,
        remainingWithInvoice,
        remainingNoInvoice,
        shareRate: total > 0 ? (row.billed / total) * 100 : 0,
      };
    });
}
