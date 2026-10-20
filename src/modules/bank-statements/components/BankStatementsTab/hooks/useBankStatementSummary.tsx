import { useMemo } from "react";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export interface UseBankStatementSummaryProps {
  data: any;
  dashboardStats: any;
  page: number;
  pageSize: number;
  t: (key: string, options?: any) => string;
}

export function useBankStatementSummary({
  data,
  dashboardStats,
  page,
  pageSize,
  t,
}: UseBankStatementSummaryProps) {
  return useMemo(() => {
    if (!data?.items || data.items.length === 0) return undefined;

    const items = data.items;
    const totalCredit = items.reduce(
      (sum: number, r: any) => sum + (Number(r.creditAmount) || 0),
      0,
    );
    const totalDebit = items.reduce(
      (sum: number, r: any) => sum + (Number(r.debitAmount) || 0),
      0,
    );
    const totalNetOff = items.reduce(
      (sum: number, r: any) => sum + (Number(r.netOffAmount) || 0),
      0,
    );
    const totalRemaining = items.reduce((sum: number, r: any) => {
      const direct = Number(r.remainingAmount);
      if (!isNaN(direct) && r.remainingAmount !== undefined)
        return sum + direct;
      const amt = Math.max(
        Number(r.creditAmount) || 0,
        Number(r.debitAmount) || 0,
      );
      const netOff = Number(r.netOffAmount) || 0;
      return sum + Math.max(0, amt - netOff);
    }, 0);

    const totalPages = data.totalPages || 1;
    const totalCount = data.total || items.length;
    const grandCashIn =
      dashboardStats?.totalCashIn !== undefined
        ? Number(dashboardStats.totalCashIn)
        : data?.totals?.grandTotalCredit !== undefined
          ? Number(data.totals.grandTotalCredit)
          : totalCredit;
    const grandCashOut =
      dashboardStats?.totalCashOut !== undefined
        ? Number(dashboardStats.totalCashOut)
        : data?.totals?.grandTotalDebit !== undefined
          ? Number(data.totals.grandTotalDebit)
          : totalDebit;
    const grandNetOff =
      data?.totals?.grandTotalNetOff !== undefined
        ? Number(data.totals.grandTotalNetOff)
        : totalNetOff;
    const grandRemaining =
      data?.totals?.grandTotalRemaining !== undefined
        ? Number(data.totals.grandTotalRemaining)
        : totalRemaining;

    const cumulativeCashIn =
      data?.totals?.cumulativeCredit !== undefined
        ? Number(data.totals.cumulativeCredit)
        : undefined;
    const cumulativeCashOut =
      data?.totals?.cumulativeDebit !== undefined
        ? Number(data.totals.cumulativeDebit)
        : undefined;
    const cumulativeNetOff =
      data?.totals?.cumulativeNetOff !== undefined
        ? Number(data.totals.cumulativeNetOff)
        : undefined;
    const cumulativeRemaining =
      data?.totals?.cumulativeRemaining !== undefined
        ? Number(data.totals.cumulativeRemaining)
        : undefined;

    return {
      transDate: null,
      description: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common.total", { defaultValue: "Tổng cộng" })}:`}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={(page - 1) * pageSize + items.length}
        />
      ),
      thu: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.thu", {
            defaultValue: "Tiền vào (Thu)",
          })}
          subtotalAmount={totalCredit}
          cumulativeAmount={cumulativeCashIn}
          grandTotalAmount={grandCashIn}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={(page - 1) * pageSize + items.length}
          valueClassName="text-emerald-600 font-bold"
        />
      ),
      chi: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.chi", {
            defaultValue: "Tiền ra (Chi)",
          })}
          subtotalAmount={totalDebit}
          cumulativeAmount={cumulativeCashOut}
          grandTotalAmount={grandCashOut}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={(page - 1) * pageSize + items.length}
          valueClassName="text-[#ea580c] font-bold"
        />
      ),
      netOffAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.netOffAmount", {
            defaultValue: "Đã cấn trừ",
          })}
          subtotalAmount={totalNetOff}
          cumulativeAmount={cumulativeNetOff}
          grandTotalAmount={grandNetOff}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={(page - 1) * pageSize + items.length}
          valueClassName="text-indigo-600 font-bold"
        />
      ),
      remainingAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("bankStatement.columns.remainingAmount", {
            defaultValue: "Còn lại",
          })}
          subtotalAmount={totalRemaining}
          cumulativeAmount={cumulativeRemaining}
          grandTotalAmount={grandRemaining}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          currentPageCount={items.length}
          cumulativeCount={(page - 1) * pageSize + items.length}
          valueClassName={
            totalRemaining === 0
              ? "text-emerald-600 font-bold"
              : "text-slate-700 dark:text-slate-300 font-bold"
          }
        />
      ),
    };
  }, [data, dashboardStats, page, pageSize, t]);
}
