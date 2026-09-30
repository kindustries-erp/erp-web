import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { CheckCircle2 } from "lucide-react";
import { money } from "@/shared/utils/format";
import type { PartnerAgingDonutChartProps } from "./PartnerAgingDonutChart.type";

export const PartnerAgingDonutChart = React.memo(
  function PartnerAgingDonutChart({
    items,
    totalBalance,
    className,
  }: PartnerAgingDonutChartProps) {
    const { t } = useTranslation(["erpInvoices", "debts"]);

    return (
      <DrawerSection
        title={t("debts:drawer.agingDistribution", "Cơ cấu phân bổ tuổi nợ")}
        collapsible
        defaultCollapsed={false}
        className={className}
      >
        <div className="flex flex-col justify-center gap-2.5 h-[250px] w-full pt-1">
          {totalBalance > 0 ? (
            <>
              <div className="relative h-[135px]">
                <DonutChart
                  items={items}
                  cutout="65%"
                  valueFormatter={(v) => money(Number(v))}
                />
              </div>
              <div className="text-[11px]">
                <DonutLegend
                  items={items}
                  valueFormatter={(v) => money(Number(v))}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
              <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
              <div className="text-xs font-semibold text-foreground">
                {t("debts:drawer.fullySettledTitle", "Đã tất toán toàn bộ")}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {t("debts:drawer.fullySettledDesc", "Không còn dư nợ quá hạn.")}
              </div>
            </div>
          )}
        </div>
      </DrawerSection>
    );
  },
);
