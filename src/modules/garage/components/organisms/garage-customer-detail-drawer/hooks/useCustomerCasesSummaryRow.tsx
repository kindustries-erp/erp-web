import React, { useMemo } from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { CustomerDebtTotals } from "../types";

interface UseCustomerCasesSummaryRowProps {
  cases: any[];
  totals: CustomerDebtTotals;
  page: number;
  pageSize: number;
  totalCount: number;
  debtType?: "receivables" | "payables";
  t: (key: string, fallback: string) => string;
}

export function useCustomerCasesSummaryRow({
  cases,
  totals,
  page,
  pageSize,
  totalCount,
  debtType = "receivables",
  t,
}: UseCustomerCasesSummaryRowProps): Record<string, React.ReactNode> {
  const isPayables = debtType === "payables";

  return useMemo(() => {
    let subtotalAmount = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;
    let subA0_30 = 0;
    let subA31_60 = 0;
    let subA61_90 = 0;
    let subAOver90 = 0;

    for (const row of cases) {
      const amt = isPayables
        ? Number(row.chiPhi) || 0
        : Number(row.tienCoThue) || 0;
      const paid = isPayables
        ? Number(row.tienDaChi) || 0
        : Number(row.tienDaThanhToan) || 0;
      const bal = isPayables
        ? Number(row.tienConPhaiChi) || 0
        : Number(row.tienConPhaiThanhToan) || 0;
      const aging = Number(row.agingDays) || 0;

      subtotalAmount += amt;
      subtotalPaid += paid;
      subtotalBal += bal;

      if (bal > 0) {
        if (aging <= 30) subA0_30 += bal;
        else if (aging <= 60) subA31_60 += bal;
        else if (aging <= 90) subA61_90 += bal;
        else subAOver90 += bal;
      }
    }

    const totalPages = Math.ceil(totalCount / (pageSize || 10)) || 1;
    const cumulativeCount = (page - 1) * pageSize + cases.length;
    const unit = t("partners.unitCases", "phiếu");

    const baseProps = {
      page,
      totalPages,
      totalCount,
      currentPageCount: cases.length,
      itemTitle: unit,
      itemUnit: unit,
    };

    const makeAmountCell = (
      metric: string,
      sub: number,
      grand: number,
      cls: string,
    ) => (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={metric}
        subtotalAmount={sub}
        grandTotalAmount={grand}
        valueClassName={cls}
        {...baseProps}
      />
    );

    const amountKey = isPayables ? "chiPhi" : "tienCoThue";
    const paidKey = isPayables ? "tienDaChi" : "tienDaThanhToan";
    const balKey = isPayables ? "tienConPhaiChi" : "tienConPhaiThanhToan";

    const balCls =
      subtotalBal === 0
        ? "font-bold text-muted-foreground/60"
        : subtotalBal < 0
          ? "font-bold text-rose-700 dark:text-rose-400"
          : "font-bold text-amber-800 dark:text-amber-300";

    const paidCls =
      subtotalPaid === 0
        ? "font-bold text-muted-foreground/60"
        : "font-bold text-emerald-700 dark:text-emerald-400";

    return {
      soChungTu: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          cumulativeCount={cumulativeCount}
          {...baseProps}
        />
      ),
      [amountKey]: makeAmountCell(
        isPayables
          ? t("payables.columns.costAmount", "Chi phí")
          : t("customers.drawer.totalAmount", "Tổng tiền"),
        subtotalAmount,
        totals.totalRevenue,
        "text-foreground font-bold",
      ),
      [paidKey]: makeAmountCell(
        isPayables
          ? t("payables.columns.paidAmount", "Đã chi")
          : t("customers.drawer.paidAmount", "Đã thu"),
        subtotalPaid,
        totals.totalPaid,
        paidCls,
      ),
      [balKey]: makeAmountCell(
        isPayables
          ? t("payables.columns.balanceAmount", "Còn phải chi")
          : t("customers.drawer.balanceAmount", "Còn nợ"),
        subtotalBal,
        totals.totalBalance,
        balCls,
      ),
      aging0_30: makeAmountCell(
        t("payables.columns.aging0_30", "0-30 ngày"),
        subA0_30,
        totals.aging0_30,
        "font-bold text-emerald-700 dark:text-emerald-400",
      ),
      aging31_60: makeAmountCell(
        t("payables.columns.aging31_60", "31-60 ngày"),
        subA31_60,
        totals.aging31_60,
        "font-bold text-amber-800 dark:text-amber-300",
      ),
      aging61_90: makeAmountCell(
        t("payables.columns.aging61_90", "61-90 ngày"),
        subA61_90,
        totals.aging61_90,
        "font-bold text-orange-700 dark:text-orange-400",
      ),
      agingOver90: makeAmountCell(
        t("payables.columns.agingOver90", ">90 ngày"),
        subAOver90,
        totals.agingOver90,
        "font-bold text-rose-700 dark:text-rose-400",
      ),
    };
  }, [cases, debtType, isPayables, page, pageSize, t, totalCount, totals]);
}
