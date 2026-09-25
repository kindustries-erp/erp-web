import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DonutChart } from "@/shared/components/charts/DonutChart";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { TrendingUp, PieChart } from "lucide-react";
import type { AgingDonutItem, MonthlyTrendItem } from "../types";

interface CustomerDebtAgingChartTabProps {
  agingDonutItems: AgingDonutItem[];
  monthlyTrendItems: MonthlyTrendItem[];
}

export const CustomerDebtAgingChartTab = React.memo(
  function CustomerDebtAgingChartTab({
    agingDonutItems,
    monthlyTrendItems,
  }: CustomerDebtAgingChartTabProps) {
    const { t } = useTranslation(["garage", "common"]);

    const chartDatasets = React.useMemo(() => {
      return [
        {
          label: t("customers.drawer.totalPaid", "Đã thu"),
          data: monthlyTrendItems.map((m) => m.paid),
          color: "#10b981", // Emerald
        },
        {
          label: t("customers.drawer.balanceAmount", "Còn nợ"),
          data: monthlyTrendItems.map((m) => m.balance),
          color: "#f59e0b", // Amber
        },
      ];
    }, [monthlyTrendItems, t]);

    const chartLabels = React.useMemo(() => {
      return monthlyTrendItems.map(
        (m) => `T${m.month.slice(5)}/${m.month.slice(0, 4)}`,
      );
    }, [monthlyTrendItems]);

    return (
      <div className="space-y-4 flex flex-col flex-1 min-h-0 w-full overflow-y-auto pr-1">
        {/* Section 1: Phân bổ Tuổi nợ */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <PieChart className="w-4 h-4 text-primary" />
              <span>
                {t(
                  "customers.drawer.agingDistribution",
                  "Cơ cấu phân bổ tuổi nợ",
                )}
              </span>
            </div>
          }
          collapsible={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
        >
          {agingDonutItems.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              <div className="w-44 h-44 shrink-0">
                <DonutChart items={agingDonutItems} />
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {agingDonutItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                      {money(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("customers.noDebt", "Khách hàng không còn dư nợ quá hạn.")}
            </div>
          )}
        </DrawerSection>

        {/* Section 2: Biến động phát sinh & thanh toán theo tháng */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>
                {t(
                  "customers.drawer.trendChartTitle",
                  "Biến động phiếu dịch vụ theo tháng",
                )}
              </span>
            </div>
          }
          collapsible={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
        >
          {monthlyTrendItems.length > 0 ? (
            <div className="h-56 w-full pt-2">
              <BarChart
                labels={chartLabels}
                datasets={chartDatasets}
                stacked={true}
                showLegend={true}
              />
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("customers.noMonthlyData", "Chưa có dữ liệu theo tháng.")}
            </div>
          )}
        </DrawerSection>
      </div>
    );
  },
);
