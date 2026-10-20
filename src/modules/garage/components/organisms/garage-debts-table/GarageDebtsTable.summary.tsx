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

    const agingMetrics = [
      {
        key: "aging0_30",
        title: t("customers.columns.aging0_30", "0-30 ngày"),
        subtotal: subtotalA0_30,
        grand: listHook.summary.totalAging0_30,
        className: "font-bold text-emerald-700 dark:text-emerald-400",
      },
      {
        key: "aging31_60",
        title: t("customers.columns.aging31_60", "31-60 ngày"),
        subtotal: subtotalA31_60,
        grand: listHook.summary.totalAging31_60,
        className: "font-bold text-amber-800 dark:text-amber-300",
      },
      {
        key: "aging61_90",
        title: t("customers.columns.aging61_90", "61-90 ngày"),
        subtotal: subtotalA61_90,
        grand: listHook.summary.totalAging61_90,
        className: "font-bold text-orange-700 dark:text-orange-400",
      },
      {
        key: "agingOver90",
        title: t("customers.columns.agingOver90", ">90 ngày"),
        subtotal: subtotalAOver90,
        grand: listHook.summary.totalAgingOver90,
        className: "font-bold text-rose-700 dark:text-rose-400",
      },
    ];

    const agingCells: Record<string, React.ReactNode> = {};
    for (const m of agingMetrics) {
      agingCells[m.key] = (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={m.title}
          itemTitle={t("customers.unitVehicle", "Biển số xe")}
          itemUnit={t("customers.unitVehicle", "xe")}
          subtotalAmount={m.subtotal}
          grandTotalAmount={m.grand}
          cumulativeAmount={m.subtotal}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          cumulativeCount={cumCount}
          valueClassName={m.className}
        />
      );
    }

    return {
      licensePlate: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={listHook.page}
          totalPages={listHook.totalPages}
          totalCount={listHook.total}
          currentPageCount={items.length}
          cumulativeCount={cumCount}
          itemTitle={t("customers.unitVehicle", "Biển số xe")}
          itemUnit={t("customers.unitVehicle", "xe")}
        />
      ),
      caseCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("customers.columns.caseCount", "Số lượng phiếu DV")}
          itemTitle={t("customers.unitVehicle", "Biển số xe")}
          itemUnit={t("customers.unitVehicle", "xe")}
          subtotalQty={subtotalCases}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          cumulativeCount={cumCount}
          cumulativeQty={subtotalCases}
          valueClassName="text-primary font-bold"
        />
      ),
      paymentProgress: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.totalReceivable", "Tổng phải thu")}
          itemTitle={t("customers.unitVehicle", "Biển số xe")}
          itemUnit={t("customers.unitVehicle", "xe")}
          subtotalAmount={subtotalRev}
          grandTotalAmount={listHook.summary.totalRevenue}
          cumulativeAmount={subtotalRev}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          cumulativeCount={cumCount}
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
          itemTitle={t("customers.unitVehicle", "Biển số xe")}
          itemUnit={t("customers.unitVehicle", "xe")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={listHook.summary.totalBalance}
          cumulativeAmount={subtotalBal}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          cumulativeCount={cumCount}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "font-bold text-destructive"
          }
        />
      ),
      ...agingCells,
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
