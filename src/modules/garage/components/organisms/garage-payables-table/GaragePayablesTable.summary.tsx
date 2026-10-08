import { useMemo } from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { useGarageSuppliersList } from "@/modules/garage/hooks/useGarageSuppliersList";

interface UseGaragePayablesSummaryRowProps {
  listHook: ReturnType<typeof useGarageSuppliersList>;
  t: (key: string, fallback: string) => string;
}

export function useGaragePayablesSummaryRow({
  listHook,
  t,
}: UseGaragePayablesSummaryRowProps) {
  return useMemo(() => {
    const items = listHook.data || [];
    let subtotalCost = 0;
    let subtotalBal = 0;
    let subtotalCases = 0;
    let subtotalA0_30 = 0;
    let subtotalA31_60 = 0;
    let subtotalA61_90 = 0;
    let subtotalAOver90 = 0;

    for (const row of items) {
      subtotalCost += Number(row.costAmount) || 0;
      subtotalBal += Number(row.balanceAmount) || 0;
      subtotalCases += Number(row.caseCount) || 0;
      subtotalA0_30 += Number(row.aging0_30) || 0;
      subtotalA31_60 += Number(row.aging31_60) || 0;
      subtotalA61_90 += Number(row.aging61_90) || 0;
      subtotalAOver90 += Number(row.agingOver90) || 0;
    }

    const cumCount = (listHook.page - 1) * listHook.pageSize + items.length;
    const unit = t("payables.unitCustomer", "khách hàng");

    const grandCost =
      Number(listHook.summary.totalCost ?? listHook.summary.totalPsCo) || 0;
    const grandBal =
      Number(listHook.summary.totalBalance ?? listHook.summary.totalCkCo) || 0;

    return {
      customerName: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={listHook.page}
          totalPages={listHook.totalPages}
          totalCount={listHook.total}
          currentPageCount={items.length}
          cumulativeCount={cumCount}
          itemTitle={unit}
          itemUnit={unit}
        />
      ),
      caseCount: (
        <span className="font-mono text-xs font-semibold tabular-nums text-primary block text-center">
          {subtotalCases}
        </span>
      ),
      costAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.costAmount", "Chi phí báo giá")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalCost}
          grandTotalAmount={grandCost}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-foreground font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.balanceAmount", "Còn phải chi")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalBal}
          grandTotalAmount={grandBal}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-muted-foreground/60"
              : "font-bold text-amber-800 dark:text-amber-300"
          }
        />
      ),
      aging0_30: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.aging0_30", "0-30 ngày")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalA0_30}
          grandTotalAmount={listHook.summary.totalAging0_30}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-emerald-700 dark:text-emerald-400"
        />
      ),
      aging31_60: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.aging31_60", "31-60 ngày")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalA31_60}
          grandTotalAmount={listHook.summary.totalAging31_60}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-amber-800 dark:text-amber-300"
        />
      ),
      aging61_90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.aging61_90", "61-90 ngày")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalA61_90}
          grandTotalAmount={listHook.summary.totalAging61_90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-orange-700 dark:text-orange-400"
        />
      ),
      agingOver90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("payables.columns.agingOver90", ">90 ngày")}
          itemTitle={unit}
          itemUnit={unit}
          subtotalAmount={subtotalAOver90}
          grandTotalAmount={listHook.summary.totalAgingOver90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-rose-700 dark:text-rose-400"
        />
      ),
    };
  }, [listHook, t]);
}
