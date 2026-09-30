import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { BarChart } from "@/shared/components/charts/BarChart";
import { Percent } from "lucide-react";
import type { PartnerRecoveryRateChartProps } from "./PartnerRecoveryRateChart.type";

export const PartnerRecoveryRateChart = React.memo(
  function PartnerRecoveryRateChart({
    labels,
    datasets,
    isCustomer,
    className,
  }: PartnerRecoveryRateChartProps) {
    const { t } = useTranslation(["erpInvoices", "debts"]);

    return (
      <DrawerSection
        title={
          isCustomer
            ? t(
                "debts:drawer.recoveryRateTitle",
                "Tỷ lệ thu hồi nợ theo từng tháng (%)",
              )
            : t(
                "debts:drawer.paymentRateTitle",
                "Tỷ lệ thanh toán theo từng tháng (%)",
              )
        }
        collapsible
        defaultCollapsed={false}
        className={className}
      >
        <div className="relative h-[250px] w-full pt-1">
          {labels.length > 0 ? (
            <BarChart
              labels={labels}
              datasets={datasets}
              showLegend={true}
              yMax={100}
              yCallback={(v) => `${v}%`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
              <Percent className="w-8 h-8 opacity-30" />
              <span>
                {t(
                  "debts:drawer.noRateData",
                  "Chưa có dữ liệu tỷ lệ theo tháng",
                )}
              </span>
            </div>
          )}
        </div>
      </DrawerSection>
    );
  },
);
