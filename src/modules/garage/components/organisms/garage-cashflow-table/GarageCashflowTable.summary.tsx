import React from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { CashflowSummaryRowParams } from "./GarageCashflowTable.type";

export function buildCashflowSummaryRow({
  items,
  stats,
  page,
  pageSize,
  total,
  t,
}: CashflowSummaryRowParams): Record<string, React.ReactNode> {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const cumCount = (page - 1) * pageSize + items.length;

  let subtotalReceipt = 0;
  let subtotalPayment = 0;

  for (const item of items) {
    const amt = Number(item.amount || 0);
    if (item.settlementType === "RECEIPT") {
      subtotalReceipt += amt;
    } else {
      subtotalPayment += amt;
    }
  }

  const subtotalNet = subtotalReceipt - subtotalPayment;
  const grandNet = stats ? stats.netCashflow : subtotalNet;

  return {
    transDate: (
      <SubtotalSummaryCell
        variantType="label"
        label={`${t("cases.common.total", "Tổng cộng")}:`}
        page={page}
        totalPages={totalPages}
        totalCount={total}
        currentPageCount={items.length}
        cumulativeCount={cumCount}
        itemTitle={t("cases.cashflow.summaryTitle", "Giao dịch")}
        itemUnit={t("cases.cashflow.summaryUnit", "mục")}
      />
    ),
    amount: (
      <div className="w-full flex justify-end">
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("cases.cashflow.colAmount", "Dòng tiền thuần")}
          subtotalAmount={subtotalNet}
          grandTotalAmount={grandNet}
          page={page}
          totalPages={totalPages}
          currentPageCount={items.length}
          totalCount={total}
          valueClassName={`font-bold ${
            subtotalNet >= 0
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        />
      </div>
    ),
  };
}
