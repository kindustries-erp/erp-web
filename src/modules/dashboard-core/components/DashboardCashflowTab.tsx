import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { useT } from "@/core/i18n";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money } from "@/shared/utils/format";

export interface DashboardCashflowTabProps {
  filter: {
    state: {
      dateFrom?: string;
      dateTo?: string;
      custom: Record<string, string | undefined>;
    };
  };
}

export function DashboardCashflowTab({ filter }: DashboardCashflowTabProps) {
  const t = useT();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient();

  const { data: bankAccounts = [], isFetching: isFetchingBankAccounts } =
    useQuery({
      queryKey: [
        "bankAccounts",
        filter.state.custom.branchId,
        filter.state.dateFrom,
        filter.state.dateTo,
      ],
      queryFn: () =>
        bankStatementApi.getBankAccounts(
          filter.state.custom.branchId as string,
          filter.state.dateFrom,
          filter.state.dateTo,
        ),
    });

  const { data: cashBooks = [], isFetching: isFetchingCashBooks } = useQuery({
    queryKey: [
      "cashBooks",
      filter.state.custom.branchId,
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      bankStatementApi.getCashBooks(
        filter.state.custom.branchId as string,
        filter.state.dateFrom,
        filter.state.dateTo,
      ),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
      filter.state.custom.sourceType,
      filter.state.custom.tagIds,
    ],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        sourceType: (filter.state.custom.sourceType as any) || undefined,
        tagIds:
          (filter.state.custom.tagIds as unknown as string[]) || undefined,
      }),
  });

  const isFetchingAll =
    isFetchingBankAccounts || isFetchingCashBooks || isFetching;

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const cashTrendLabels = data?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = data?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = data?.cashTrend?.map((t: any) => t.cashOut) || [];

  const sourceLabels = data?.sourceBreakdown?.map((t: any) => t.label) || [];

  return (
    <>
      {/* Account Balances */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {bankAccounts.map((acc: any) => (
          <AccountBalanceCard
            key={acc.id}
            loading={isFetchingAll}
            label={`${acc.bankName || acc.bankCode} - ${acc.accountNumber}`}
            openingBalance={acc.openingBalance}
            totalCredit={acc.totalCredit}
            totalDebit={acc.totalDebit}
            currentBalance={acc.currentBalance}
          />
        ))}
        {cashBooks.map((book: any) => (
          <AccountBalanceCard
            key={book.id}
            loading={isFetchingAll}
            label={book.name}
            openingBalance={book.openingBalance}
            totalCredit={book.totalCredit}
            totalDebit={book.totalDebit}
            currentBalance={book.currentBalance}
          />
        ))}
      </div>

      {/* Panels row */}
      <div className="mb-4">
        <Panel title={t("dashboard.cashTrend")} extra={<PanelMore />}>
          <div className="relative h-[210px]">
            {!isLoading && cashTrendLabels.length > 0 ? (
              <BarChart
                labels={cashTrendLabels}
                yCallback={(v) => money(Number(v))}
                datasets={[
                  {
                    data: cashTrendIn,
                    color: barIn,
                    label: t("dashboard.cashIn"),
                  },
                  {
                    data: cashTrendOut,
                    color: barOut,
                    label: t("dashboard.cashOut"),
                  },
                ]}
              />
            ) : isLoading ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label={t("dashboard.cashIn")} />
            <LegendItem color={barOut} label={t("dashboard.cashOut")} />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 min-[900px]:grid-cols-2 lg:grid-cols-3 gap-3">
        {sourceLabels.length > 0 ? (
          sourceLabels.map((label: string, idx: number) => {
            const trendData = data?.sourceBreakdown?.[idx]?.trend || [];
            const labels = trendData.map((t: any) => t.label) || [""];
            const inData = trendData.map((t: any) => t.cashIn) || [0];
            const outData = trendData.map((t: any) => t.cashOut) || [0];
            return (
              <Panel key={label} title={label} extra={<PanelMore />}>
                <div className="relative h-[210px]">
                  <BarChart
                    labels={labels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      {
                        data: inData,
                        color: barIn,
                        label: t("dashboard.cashIn"),
                      },
                      {
                        data: outData,
                        color: barOut,
                        label: t("dashboard.cashOut"),
                      },
                    ]}
                  />
                </div>
                <div className="flex gap-4 mt-[10px]">
                  <LegendItem color={barIn} label={t("dashboard.cashIn")} />
                  <LegendItem color={barOut} label={t("dashboard.cashOut")} />
                </div>
              </Panel>
            );
          })
        ) : (
          <Panel title="Dòng tiền theo Nguồn" extra={<PanelMore />}>
            <div className="relative h-[210px]">
              {isLoading ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}

// ── Helpers ──
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)]">{label}</span>
    </div>
  );
}

function AccountBalanceCard({
  label,
  openingBalance = 0,
  totalCredit = 0,
  totalDebit = 0,
  currentBalance = 0,
  loading,
}: {
  label: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  loading?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-3 max-[480px]:p-2 flex flex-col justify-between">
      <div className="text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 text-[10px] truncate">
        {label}
      </div>

      {loading ? (
        <div className="space-y-2 mb-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-5 w-full rounded mt-2" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">Đầu kỳ:</span>
            <span className="font-medium text-foreground">
              {money(openingBalance)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">Thu trong kỳ:</span>
            <span className="font-medium text-emerald-600">
              +{money(totalCredit)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-2">
            <span className="text-[color:var(--muted-fg)]">Chi trong kỳ:</span>
            <span className="font-medium text-[#ea580c]">
              -{money(totalDebit)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-2 mt-auto">
            <span className="text-[10px] font-semibold text-[color:var(--muted-fg)] uppercase">
              Cuối kỳ:
            </span>
            <span className="font-bold text-[16px] text-foreground">
              {money(currentBalance)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
