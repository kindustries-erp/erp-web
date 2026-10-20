import React from "react";
import type { TFunction } from "i18next";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { MonthlyTableSummaryTotals } from "./PartnerMonthlyDebtTable.columns";

export function getMonthlyDebtTableSummaryRow(
  rowCount: number,
  totals: MonthlyTableSummaryTotals,
  isCustomer: boolean,
  t: TFunction,
) {
  if (rowCount === 0) return undefined;
  return {
    index: (
      <SubtotalSummaryCell
        variantType="label"
        label={`${t("common:total", "Tổng cộng")}:`}
        totalCount={rowCount}
        currentPageCount={rowCount}
      />
    ),
    invoiceCount: (
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle={t("debts:drawer.invoiceCount", "Số HĐ")}
        itemTitle={t("debts:unitInvoice", "hóa đơn")}
        itemUnit="HĐ"
        subtotalQty={totals.invoiceCount}
        grandTotalQty={totals.invoiceCount}
      />
    ),
    totalAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("debts:drawer.totalAmount", "Tổng tiền")}
        subtotalAmount={totals.totalAmount}
        grandTotalAmount={totals.totalAmount}
      />
    ),
    paidAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={
          isCustomer
            ? t("debts:drawer.collectedAmount", "Đã thu")
            : t("debts:drawer.paidAmount", "Đã trả")
        }
        subtotalAmount={totals.paidAmount}
        grandTotalAmount={totals.paidAmount}
      />
    ),
    balanceAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("debts:drawer.balanceAmount", "Còn nợ")}
        subtotalAmount={totals.balanceAmount}
        grandTotalAmount={totals.balanceAmount}
      />
    ),
    rate: (
      <SubtotalSummaryCell
        variantType="label"
        label={
          <span className="font-mono text-xs font-bold text-foreground">
            {totals.rate}%
          </span>
        }
      />
    ),
  };
}
