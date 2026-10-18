import React, { useMemo } from "react";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { CashflowLegendItem } from "../../molecules/cashflow-legend-item";
import type { GarageCashflowTrendPanelProps } from "./GarageCashflowTrendPanel.type";

const BAR_IN_COLOR = "#059669"; // Emerald 600
const BAR_OUT_COLOR = "#ea580c"; // Orange 600

export const GarageCashflowTrendPanel: React.FC<
  GarageCashflowTrendPanelProps
> = ({ trend = [], loading = false }) => {
  const t = useT();

  const labels = useMemo(() => trend.map((item) => item.label), [trend]);
  const cashInData = useMemo(() => trend.map((item) => item.cashIn), [trend]);
  const cashOutData = useMemo(() => trend.map((item) => item.cashOut), [trend]);

  return (
    <div className="mb-4">
      <Panel
        title={t("garage.cashflow.trend.title", "Xu hướng thu chi theo tháng")}
      >
        <div className="relative h-[220px]">
          {loading ? (
            <ChartSkeleton type="bar" />
          ) : labels.length > 0 ? (
            <BarChart
              labels={labels}
              yCallback={(v) => money(Number(v))}
              datasets={[
                {
                  data: cashInData,
                  color: BAR_IN_COLOR,
                  label: t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)"),
                },
                {
                  data: cashOutData,
                  color: BAR_OUT_COLOR,
                  label: t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)"),
                },
              ]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-2.5">
          <CashflowLegendItem
            color={BAR_IN_COLOR}
            label={t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)")}
          />
          <CashflowLegendItem
            color={BAR_OUT_COLOR}
            label={t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)")}
          />
        </div>
      </Panel>
    </div>
  );
};
