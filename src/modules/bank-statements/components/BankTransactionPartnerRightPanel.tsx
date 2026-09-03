import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { BankTransactionGeneralInfoSection } from "./BankTransactionGeneralInfoSection";

export interface BankTransactionPartnerRightPanelProps {
  transaction: any | null;
}

export const BankTransactionPartnerRightPanel = React.memo(
  function BankTransactionPartnerRightPanel({
    transaction,
  }: BankTransactionPartnerRightPanelProps) {
    const { t } = useTranslation();

    const partnerName = transaction?.correspondentName?.trim() || "";
    const correspondentAccount =
      transaction?.correspondentAccount?.trim() || "";

    const { data: statsData, isLoading: isLoadingStats } = useQuery({
      queryKey: ["bank-partner-stats", correspondentAccount, partnerName],
      queryFn: () =>
        bankStatementApi.getDashboardStats({
          correspondentAccount: correspondentAccount || undefined,
          correspondentName: partnerName || undefined,
        }),
      enabled: !!(correspondentAccount || partnerName),
    });

    const barIn = "#059669"; // Emerald 600 (Thu)
    const barOut = "#ea580c"; // Orange 600 (Chi)

    const cashTrendLabels =
      statsData?.cashTrend?.map((item) => item.label) || [];
    const cashTrendIn = statsData?.cashTrend?.map((item) => item.cashIn) || [];
    const cashTrendOut =
      statsData?.cashTrend?.map((item) => item.cashOut) || [];

    const totalIn =
      statsData?.totalCashIn ??
      cashTrendIn.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const totalOut =
      statsData?.totalCashOut ??
      cashTrendOut.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const netFlow = statsData?.netCashFlow ?? totalIn - totalOut;

    if (!correspondentAccount && !partnerName) {
      return (
        <div className="space-y-4 pb-3">
          <BankTransactionGeneralInfoSection transaction={transaction} />
          <div className="p-4 text-xs text-muted-foreground italic text-center">
            {t("bankStatement.noPartnerData", {
              defaultValue:
                "Chưa có thông tin đối tác/tài khoản đối ứng cho giao dịch này",
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-3">
        {/* 1. THÔNG TIN CHUNG (kèm đối tác, chi nhánh MapPin, tài khoản nguồn, v.v.) */}
        <BankTransactionGeneralInfoSection transaction={transaction} />

        {/* 2. Tổng quan Dòng tiền & Biểu đồ compact */}
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>
                {t("bankStatement.cashTrendOverview", {
                  defaultValue: "Tổng quan Dòng tiền",
                })}
              </span>
            </div>
          }
          collapsible={true}
        >
          <div className="space-y-3">
            {/* Compact KPI Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t("bankStatement.totalIn", { defaultValue: "Tổng thu" })}
                </div>
                <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                  {money(totalIn)}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {t("bankStatement.totalOut", { defaultValue: "Tổng chi" })}
                </div>
                <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                  {money(totalOut)}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-surface border border-border/70 text-xs flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("bankStatement.netCashFlow", {
                  defaultValue: "Dòng tiền thuần",
                })}
                :
              </span>
              <span
                className={`font-bold tabular-nums text-xs ${
                  netFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {netFlow >= 0
                  ? `+${money(netFlow)}`
                  : `-${money(Math.abs(netFlow))}`}
              </span>
            </div>

            {/* Compact BarChart */}
            <div className="relative h-[140px] pt-1">
              {!isLoadingStats && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendIn,
                      color: barIn,
                      label: t("bankStatement.columns.thu", {
                        defaultValue: "Thu",
                      }),
                    },
                    {
                      data: cashTrendOut,
                      color: barOut,
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
          </div>
        </DrawerSection>
      </div>
    );
  },
);
