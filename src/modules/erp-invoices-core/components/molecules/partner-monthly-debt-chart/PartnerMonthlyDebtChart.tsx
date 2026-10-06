import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { FileText } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { PartnerMonthlyDebtChartProps } from "./PartnerMonthlyDebtChart.type";

export const PartnerMonthlyDebtChart = React.memo(
  function PartnerMonthlyDebtChart({
    labels,
    datasets,
    isLoading = false,
    className,
  }: PartnerMonthlyDebtChartProps) {
    const { t } = useTranslation(["erpInvoices", "debts"]);

    return (
      <div className={cn("relative h-[250px] w-full pt-1", className)}>
        {isLoading ? (
          <ChartSkeleton type="bar" />
        ) : labels.length > 0 ? (
          <BarChart
            labels={labels}
            stacked={true}
            showLegend={true}
            yCallback={(v) => money(Number(v))}
            datasets={datasets}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
            <FileText className="w-8 h-8 opacity-30" />
            <span>
              {t(
                "debts:drawer.noMonthlyTrendData",
                "Chưa có dữ liệu biến động dòng tiền theo tháng",
              )}
            </span>
          </div>
        )}
      </div>
    );
  },
);
