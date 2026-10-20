import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";

export interface UsePartnerTransactionsLogicProps {
  open: boolean;
  correspondentAccount?: string;
  correspondentName?: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalBranchId?: string;
  t: (key: string, options?: any) => string;
}

export function usePartnerTransactionsLogic({
  open,
  correspondentAccount,
  correspondentName,
  globalStartDate,
  globalEndDate,
  globalBranchId,
  t,
}: UsePartnerTransactionsLogicProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );

  const tableState = useTableColumnState("partner-transactions-table-v1");

  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: [
      "partner-chart",
      correspondentAccount,
      correspondentName,
      globalStartDate,
      globalEndDate,
      globalBranchId,
    ],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        startDate: globalStartDate,
        endDate: globalEndDate,
        branchId: globalBranchId,
        correspondentAccount,
        correspondentName,
      }),
    enabled: open && (!!correspondentAccount || !!correspondentName),
  });

  const { data: tableData, isFetching: isTableFetching } = useQuery({
    queryKey: [
      "partner-transactions",
      correspondentAccount,
      correspondentName,
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
      globalStartDate,
      globalEndDate,
      globalBranchId,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy,
        sortOrder,
        startDate: globalStartDate,
        endDate: globalEndDate,
        branchId: globalBranchId,
        correspondentAccount,
        correspondentName,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open && (!!correspondentAccount || !!correspondentName),
  });

  const fetchColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search?: string;
      pageParam?: number;
      filtersStr?: string;
    }) => {
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (correspondentAccount) {
        currentFilters["correspondentAccount"] = [correspondentAccount];
      }
      if (correspondentName) {
        currentFilters["correspondentName"] = [correspondentName];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      return bankStatementApi.getColumnOptions(
        columnKey,
        search || "",
        pageParam || 1,
        20,
        newFiltersStr,
      );
    },
    [correspondentAccount, correspondentName],
  );

  const items = tableData?.items || [];
  const total = tableData?.total || 0;
  const totalPages = tableData?.totalPages || 1;

  const summaryRow = useMemo(() => {
    if (!items || items.length === 0) return undefined;

    const totalDebit = items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );
    const totalNetOff = items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = items.reduce((acc: number, curr: any) => {
      const direct = Number(curr.remainingAmount);
      if (!isNaN(direct) && curr.remainingAmount !== undefined)
        return acc + direct;
      const amt = Math.max(
        parseFloat(curr.creditAmount) || 0,
        parseFloat(curr.debitAmount) || 0,
      );
      const netOff = parseFloat(curr.netOffAmount) || 0;
      return acc + Math.max(0, amt - netOff);
    }, 0);

    const grandCredit = Number(
      tableData?.totals?.grandTotalCredit !== undefined
        ? tableData.totals.grandTotalCredit
        : totalCredit,
    );
    const grandDebit = Number(
      tableData?.totals?.grandTotalDebit !== undefined
        ? tableData.totals.grandTotalDebit
        : totalDebit,
    );
    const grandNetOff = Number(
      tableData?.totals?.grandTotalNetOff !== undefined
        ? tableData.totals.grandTotalNetOff
        : totalNetOff,
    );
    const grandRemaining = Number(
      tableData?.totals?.grandTotalRemaining !== undefined
        ? tableData.totals.grandTotalRemaining
        : totalRemaining,
    );

    const cumulativeCredit =
      tableData?.totals?.cumulativeCredit !== undefined
        ? Number(tableData.totals.cumulativeCredit)
        : undefined;
    const cumulativeDebit =
      tableData?.totals?.cumulativeDebit !== undefined
        ? Number(tableData.totals.cumulativeDebit)
        : undefined;
    const cumulativeNetOff =
      tableData?.totals?.cumulativeNetOff !== undefined
        ? Number(tableData.totals.cumulativeNetOff)
        : undefined;
    const cumulativeRemaining =
      tableData?.totals?.cumulativeRemaining !== undefined
        ? Number(tableData.totals.cumulativeRemaining)
        : undefined;

    return {
      transDate: null,
      description: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common.total", { defaultValue: "Tổng cộng" })}:`}
          page={page}
          totalPages={totalPages}
          totalCount={total}
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
          cumulativeAmount={cumulativeCredit}
          grandTotalAmount={grandCredit}
          page={page}
          totalPages={totalPages}
          totalCount={total}
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
          cumulativeAmount={cumulativeDebit}
          grandTotalAmount={grandDebit}
          page={page}
          totalPages={totalPages}
          totalCount={total}
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
          totalCount={total}
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
          totalCount={total}
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
  }, [items, tableData, page, pageSize, totalPages, total, t]);

  const cashTrendLabels = chartData?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = chartData?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = chartData?.cashTrend?.map((t: any) => t.cashOut) || [];

  return {
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    detailTransactionId,
    setDetailTransactionId,
    chartData,
    isChartLoading,
    tableData,
    isTableFetching,
    items,
    total,
    totalPages,
    fetchColumnOptions,
    summaryRow,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
  };
}
