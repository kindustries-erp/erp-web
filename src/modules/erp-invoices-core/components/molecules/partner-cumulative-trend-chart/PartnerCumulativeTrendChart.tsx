import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { LineChart } from "@/shared/components/charts/LineChart";
import { TrendingUp } from "lucide-react";
import { money } from "@/shared/utils/format";
import type { PartnerCumulativeTrendChartProps } from "./PartnerCumulativeTrendChart.type";

export const PartnerCumulativeTrendChart = React.memo(
  function PartnerCumulativeTrendChart({
    labels,
    datasets,
    className,
  }: PartnerCumulativeTrendChartProps) {
    const { t } = useTranslation(["erpInvoices", "debts"]);

    return (
      <DrawerSection
        title={t(
          "debts:drawer.cumulativeTrendTitle",
          "Biểu đồ luân chuyển & Dòng tiền tích lũy",
        )}
        collapsible
        defaultCollapsed={false}
        className={className}
      >
        <div className="relative h-[250px] w-full pt-1">
          {labels.length > 0 ? (
            <LineChart
              labels={labels}
              datasets={datasets}
              showLegend={true}
              yCallback={(v) => money(Number(v))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
              <TrendingUp className="w-8 h-8 opacity-30" />
              <span>
                {t(
                  "debts:drawer.noCumulativeTrendData",
                  "Chưa có dữ liệu dòng tiền tích lũy",
                )}
              </span>
            </div>
          )}
        </div>
      </DrawerSection>
    );
  },
);
