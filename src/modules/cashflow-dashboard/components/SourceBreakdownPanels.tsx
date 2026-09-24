import { Panel, PanelMore } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { LegendItem } from "./CashTrendPanel";

export interface SourceBreakdownPanelsProps {
  data: any;
  sourceLabels: string[];
  isLoading?: boolean;
}

export function SourceBreakdownPanels({
  data,
  sourceLabels,
  isLoading,
}: SourceBreakdownPanelsProps) {
  const t = useT();
  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {sourceLabels.length > 0 ? (
        sourceLabels.map((label: string, idx: number) => {
          const trendData = data?.sourceBreakdown?.[idx]?.trend || [];
          const labels = trendData.map((item: any) => item.label) || [""];
          const inData = trendData.map((item: any) => item.cashIn) || [0];
          const outData = trendData.map((item: any) => item.cashOut) || [0];

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
                      label: t("dashboard.cashIn", "Tiền vào (Thu)"),
                    },
                    {
                      data: outData,
                      color: barOut,
                      label: t("dashboard.cashOut", "Tiền ra (Chi)"),
                    },
                  ]}
                />
              </div>
              <div className="flex gap-4 mt-[10px]">
                <LegendItem
                  color={barIn}
                  label={t("dashboard.cashIn", "Tiền vào (Thu)")}
                />
                <LegendItem
                  color={barOut}
                  label={t("dashboard.cashOut", "Tiền ra (Chi)")}
                />
              </div>
            </Panel>
          );
        })
      ) : (
        <Panel
          title={t("cashflow.sourceCashflow", "Dòng tiền theo Nguồn")}
          extra={<PanelMore />}
        >
          <div className="relative h-[210px]">
            {isLoading ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData", "Chưa có dữ liệu")}
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
