import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";
import { ChartTableSwitch } from "../../molecules/chart-table-switch";
import { PartnerMonthlyDebtChart } from "../../molecules/partner-monthly-debt-chart";
import { PartnerMonthlyDebtTable } from "../../molecules/partner-monthly-debt-table";
import { PartnerAgingDonutChart } from "../../molecules/partner-aging-donut-chart";
import { PartnerCumulativeTrendChart } from "../../molecules/partner-cumulative-trend-chart";
import { PartnerRecoveryRateChart } from "../../molecules/partner-recovery-rate-chart";
import { usePartnerDebtAnalytics } from "./PartnerDebtAnalyticsSection.hook";
import type { PartnerDebtAnalyticsSectionProps } from "./PartnerDebtAnalyticsSection.type";

export const PartnerDebtAnalyticsSection = React.memo(
  function PartnerDebtAnalyticsSection({
    invoices,
    isLoading,
    isCustomer,
    className,
  }: PartnerDebtAnalyticsSectionProps) {
    const { t } = useTranslation(["erpInvoices", "debts"]);
    const [monthlyViewMode, setMonthlyViewMode] = useState<"chart" | "table">(
      "chart",
    );

    const {
      totals,
      monthlyBarLabels,
      monthlyBarDatasets,
      monthlyTableRows,
      agingDonutItems,
      cumulativeTrendLabels,
      cumulativeTrendDatasets,
      recoveryRateLabels,
      recoveryRateDatasets,
    } = usePartnerDebtAnalytics(invoices, isCustomer);

    return (
      <div className={cn("space-y-4 pb-2 w-full", className)}>
        {/* HÀNG 1: GRID 3:1 (BIẾN ĐỘNG PHÁT SINH THEO THÁNG + CƠ CẤU TUỔI NỢ) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          <div className="xl:col-span-3">
            <DrawerSection
              title={t(
                "debts:drawer.trendChartTitle",
                "Biến động hóa đơn theo tháng",
              )}
              collapsible
              defaultCollapsed={false}
              titleExtra={
                <ChartTableSwitch
                  value={monthlyViewMode}
                  onChange={setMonthlyViewMode}
                />
              }
            >
              {monthlyViewMode === "chart" ? (
                <PartnerMonthlyDebtChart
                  labels={monthlyBarLabels}
                  datasets={monthlyBarDatasets}
                  isLoading={isLoading}
                />
              ) : (
                <PartnerMonthlyDebtTable
                  rows={monthlyTableRows}
                  isCustomer={isCustomer}
                  isLoading={isLoading}
                />
              )}
            </DrawerSection>
          </div>
          <div className="xl:col-span-1">
            <PartnerAgingDonutChart
              items={agingDonutItems}
              totalBalance={totals.totalBalance}
            />
          </div>
        </div>

        {/* HÀNG 2: GRID 1:1 (DÒNG TIỀN LŨY KẾ & TỶ LỆ HOÀN TẤT THANH TOÁN THEO THÁNG) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <PartnerCumulativeTrendChart
            labels={cumulativeTrendLabels}
            datasets={cumulativeTrendDatasets}
          />
          <PartnerRecoveryRateChart
            labels={recoveryRateLabels}
            datasets={recoveryRateDatasets}
            isCustomer={isCustomer}
          />
        </div>
      </div>
    );
  },
);
