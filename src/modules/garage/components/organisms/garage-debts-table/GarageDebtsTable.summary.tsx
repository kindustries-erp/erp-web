import React, { useMemo } from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { useGarageCustomersList } from "@/modules/garage/hooks/useGarageCustomersList";

interface UseGarageDebtsSummaryRowProps {
  listHook: ReturnType<typeof useGarageCustomersList>;
  t: (key: string, fallback: string) => string;
}

export function useGarageDebtsSummaryRow({
  listHook,
  t,
}: UseGarageDebtsSummaryRowProps) {
  return useMemo(() => {
    const items = listHook.data || [];
    let subtotalCases = 0;
    let subtotalRev = 0;
    let subtotalBal = 0;
    let subtotalA0_30 = 0;
    let subtotalA31_60 = 0;
    let subtotalA61_90 = 0;
    let subtotalAOver90 = 0;

    for (const row of items) {
      subtotalCases += Number(row.caseCount) || 0;
      subtotalRev += Number(row.totalAmount) || 0;
      subtotalBal += Number(row.balanceAmount) || 0;
      subtotalA0_30 += Number(row.aging0_30) || 0;
      subtotalA31_60 += Number(row.aging31_60) || 0;
      subtotalA61_90 += Number(row.aging61_90) || 0;
      subtotalAOver90 += Number(row.agingOver90) || 0;
    }

    const cumCount = (listHook.page - 1) * listHook.pageSize + items.length;

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
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
        />
      ),
      caseCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("customers.columns.caseCount", "Số lượng phiếu DV")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalQty={subtotalCases}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-primary font-bold"
        />
      ),
      paymentProgress: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.totalReceivable", "Tổng phải thu")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalRev}
          grandTotalAmount={listHook.summary.totalRevenue}
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
          metricTitle={t(
            "customers.columns.remainingReceivable",
            "Còn phải thu",
          )}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={listHook.summary.totalBalance}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "font-bold text-destructive"
          }
        />
      ),
      aging0_30: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.aging0_30", "0-30 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
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
          metricTitle={t("customers.columns.aging31_60", "31-60 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
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
          metricTitle={t("customers.columns.aging61_90", "61-90 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
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
          metricTitle={t("customers.columns.agingOver90", ">90 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
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
  }, [
    listHook.data,
    listHook.page,
    listHook.pageSize,
    listHook.total,
    listHook.totalPages,
    listHook.summary,
    t,
  ]);
}
