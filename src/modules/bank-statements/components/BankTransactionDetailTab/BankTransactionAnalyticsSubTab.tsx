import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { BankTransactionPartnerEmptyState } from "./components/BankTransactionPartnerEmptyState";
import { BankTransactionAnalyticsKpis } from "./components/BankTransactionAnalyticsKpis";

export interface BankTransactionAnalyticsSubTabProps {
  transaction: any | null;
}

export const BankTransactionAnalyticsSubTab = React.memo(
  function BankTransactionAnalyticsSubTab({
    transaction,
  }: BankTransactionAnalyticsSubTabProps) {
    const { t } = useTranslation();

    const partnerName = transaction?.correspondentName?.trim() || "";
    const correspondentAccount =
      transaction?.correspondentAccount?.trim() || "";

    // 1. Query Partner Stats
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
      queryKey: ["bank-partner-stats", correspondentAccount, partnerName],
      queryFn: () =>
        bankStatementApi.getDashboardStats({
          correspondentAccount: correspondentAccount || undefined,
          correspondentName: partnerName || undefined,
        }),
      enabled: Boolean(correspondentAccount || partnerName),
    });

    // 2. Query Total Transactions Count
    const { data: partnerCountData } = useQuery({
      queryKey: [
        "partner-bank-transactions-count",
        correspondentAccount,
        partnerName,
      ],
      queryFn: () =>
        bankStatementApi.getTransactions({
          page: 1,
          pageSize: 1,
          correspondentAccount: correspondentAccount || undefined,
          correspondentName: partnerName || undefined,
        }),
      enabled: Boolean(correspondentAccount || partnerName),
      staleTime: 60000,
    });

    const partnerTotal = partnerCountData?.total || 0;
    const cashTrend = statsData?.cashTrend || [];
    const cashTrendLabels = useMemo(
      () => cashTrend.map((item) => item.label),
      [cashTrend],
    );
    const cashTrendIn = useMemo(
      () => cashTrend.map((item) => item.cashIn),
      [cashTrend],
    );
    const cashTrendOut = useMemo(
      () => cashTrend.map((item) => item.cashOut),
      [cashTrend],
    );

    const totalIn =
      statsData?.totalCashIn ??
      cashTrendIn.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const totalOut =
      statsData?.totalCashOut ??
      cashTrendOut.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const netFlow = statsData?.netCashFlow ?? totalIn - totalOut;

    // 3. Table Columns (STT 1-based, StandardTable variant spreadsheet)
    const columns: DataTableColumn<any>[] = useMemo(
      () => [
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          size: 40,
          enableResizing: false,
          cell: (_: any, idx: number) => (
            <span className="w-full block text-center font-medium text-muted-foreground">
              {idx}
            </span>
          ),
        },
        {
          key: "label",
          header: t("bankStatement.periodMonth", {
            defaultValue: "Kỳ / Tháng",
          }),
          size: 140,
          enableResizing: true,
          className: "text-left font-semibold text-foreground",
          cell: (row: any) => <span>{row.label || "—"}</span>,
        },
        {
          key: "cashIn",
          header: t("bankStatement.totalIncomeIn", {
            defaultValue: "Tổng thu (Tiền vào)",
          }),
          size: 180,
          enableResizing: true,
          className:
            "text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-medium",
          cell: (row: any) => money(Number(row.cashIn) || 0),
        },
        {
          key: "cashOut",
          header: t("bankStatement.totalExpenseOut", {
            defaultValue: "Tổng chi (Tiền ra)",
          }),
          size: 180,
          enableResizing: true,
          className:
            "text-right tabular-nums text-orange-600 dark:text-orange-400 font-medium",
          cell: (row: any) => money(Number(row.cashOut) || 0),
        },
        {
          key: "netCashflow",
          header: t("bankStatement.netCashflowCol", {
            defaultValue: "Dòng tiền thuần",
          }),
          size: 200,
          enableResizing: true,
          className: "text-right tabular-nums font-semibold",
          cell: (row: any) => {
            const net = (Number(row.cashIn) || 0) - (Number(row.cashOut) || 0);
            return (
              <span
                className={cn(
                  net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {net >= 0 ? "+" : ""}
                {money(net)}
              </span>
            );
          },
        },
      ],
      [t],
    );

    // 4. Table Summary Row
    const summaryRow = useMemo(() => {
      if (cashTrend.length === 0) return undefined;
      return {
        label: (
          <span className="font-bold text-foreground">
            {t("bankStatement.totalSummary", { defaultValue: "Tổng cộng" })}
          </span>
        ),
        cashIn: (
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {money(totalIn)}
          </span>
        ),
        cashOut: (
          <span className="font-bold tabular-nums text-orange-600 dark:text-orange-400">
            {money(totalOut)}
          </span>
        ),
        netCashflow: (
          <span
            className={cn(
              "font-bold tabular-nums",
              netFlow >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {netFlow >= 0 ? "+" : ""}
            {money(netFlow)}
          </span>
        ),
      };
    }, [cashTrend.length, t, totalIn, totalOut, netFlow]);

    if (!correspondentAccount && !partnerName) {
      return <BankTransactionPartnerEmptyState />;
    }

    return (
      <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto pr-1 w-full">
        {/* ─── 1. GRID 4 THẺ KPI SUMMARY ─── */}
        <BankTransactionAnalyticsKpis
          totalIn={totalIn}
          totalOut={totalOut}
          netFlow={netFlow}
          partnerTotal={partnerTotal}
          periodsCount={cashTrendLabels.length}
        />

        {/* ─── 2. BIỂU ĐỒ BIẾN ĐỘNG THEO THÁNG ─── */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>
                {t("bankStatement.cashTrendChartTitle", {
                  defaultValue: "Biểu đồ biến động theo tháng",
                })}
              </span>
            </div>
          }
          collapsible
          defaultCollapsed={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="h-[260px] w-full relative">
            {!isLoadingStats && cashTrendLabels.length > 0 ? (
              <BarChart
                labels={cashTrendLabels}
                yCallback={(v) => money(Number(v))}
                datasets={[
                  {
                    data: cashTrendIn,
                    color: "#059669",
                    label: t("bankStatement.columns.thu", {
                      defaultValue: "Thu",
                    }),
                  },
                  {
                    data: cashTrendOut,
                    color: "#ea580c",
                    label: t("bankStatement.columns.chi", {
                      defaultValue: "Chi",
                    }),
                  },
                ]}
              />
            ) : isLoadingStats ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                {t("bankStatement.noChartData", {
                  defaultValue: "Chưa có dữ liệu biến động dòng tiền",
                })}
              </div>
            )}
          </div>
        </DrawerSection>

        {/* ─── 3. BẢNG KÊ BIẾN ĐỘNG THEO KỲ ─── */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {t("bankStatement.cashTrendTableTitle", {
                  defaultValue: "Bảng kê biến động theo kỳ",
                })}
              </span>
              {cashTrend.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground lowercase">
                  ({cashTrend.length}{" "}
                  {t("bankStatement.periodsUnit", { defaultValue: "kỳ" })})
                </span>
              )}
            </div>
          }
          collapsible
          defaultCollapsed={false}
          className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
          bodyClassName="p-0"
        >
          <div className="min-h-[200px] flex flex-col overflow-hidden bg-background">
            <StandardTable
              items={cashTrend}
              columns={columns}
              getRowKey={(r: any) => r.label || ""}
              loading={isLoadingStats}
              variant="spreadsheet"
              minWidth={700}
              tableId="bank-statement-partner-cash-trend-table"
              enableColumnResizing
              enableRowHoverActions={false}
              summaryRow={summaryRow}
              containerClassName="flex-1 min-h-0 w-full"
            />
          </div>
        </DrawerSection>
      </div>
    );
  },
);
