import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DebtAgingDonutChart } from "@/shared/components/molecules/debt-aging-donut-chart";
import { BarChart } from "@/shared/components/charts/BarChart";
import { TrendingUp } from "lucide-react";
import { CustomerMonthlyTrendTable } from "./CustomerMonthlyTrendTable";
import type { AgingDonutItem, MonthlyTrendItem } from "../types";

interface CustomerDebtAgingChartTabProps {
  agingDonutItems: AgingDonutItem[];
  monthlyTrendItems: MonthlyTrendItem[];
  debtType?: "receivables" | "payables";
  onSelectMonth?: (month: string) => void;
}

export const CustomerDebtAgingChartTab = React.memo(
  function CustomerDebtAgingChartTab({
    agingDonutItems,
    monthlyTrendItems,
    debtType = "receivables",
    onSelectMonth,
  }: CustomerDebtAgingChartTabProps) {
    const { t } = useTranslation(["garage", "debts", "common"]);
    const isPayable = debtType === "payables";

    const totalAgingBalance = React.useMemo(
      () => agingDonutItems.reduce((acc, it) => acc + (it.value || 0), 0),
      [agingDonutItems],
    );

    const chartDatasets = React.useMemo(
      () => [
        {
          label: isPayable
            ? "Đã chi"
            : t("customers.drawer.totalPaid", "Đã thu"),
          data: monthlyTrendItems.map((m) => m.paid),
          color: "#10b981",
        },
        {
          label: isPayable
            ? "Còn phải chi"
            : t("customers.drawer.balanceAmount", "Còn nợ"),
          data: monthlyTrendItems.map((m) => m.balance),
          color: isPayable ? "#f97316" : "#f59e0b",
        },
      ],
      [monthlyTrendItems, isPayable, t],
    );

    const chartLabels = React.useMemo(
      () =>
        monthlyTrendItems.map(
          (m) => `T${m.month.slice(5)}/${m.month.slice(0, 4)}`,
        ),
      [monthlyTrendItems],
    );

    return (
      <div className="space-y-4 flex flex-col flex-1 min-h-0 w-full overflow-y-auto pr-1">
        {/* Section 1: Phân bổ Tuổi nợ */}
        <DebtAgingDonutChart
          items={agingDonutItems}
          totalBalance={totalAgingBalance}
        />

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

        {/* Section 3: Bảng danh sách chi tiết từng tháng */}
        <CustomerMonthlyTrendTable
          items={monthlyTrendItems}
          isPayable={isPayable}
          onSelectMonth={onSelectMonth}
        />
      </div>
    );
  },
);
