import { Panel, PanelMore } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)]">{label}</span>
    </div>
  );
}

export interface CashTrendPanelProps {
  labels: string[];
  cashIn: number[];
  cashOut: number[];
  isLoading?: boolean;
}

export function CashTrendPanel({
  labels,
  cashIn,
  cashOut,
  isLoading,
}: CashTrendPanelProps) {
  const t = useT();
  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  return (
    <div className="mb-4">
      <Panel
        title={t("dashboard.cashTrend", "Xu hướng dòng tiền")}
        extra={<PanelMore />}
      >
        <div className="relative h-[210px]">
          {!isLoading && labels.length > 0 ? (
            <BarChart
              labels={labels}
              yCallback={(v) => money(Number(v))}
              datasets={[
                {
                  data: cashIn,
                  color: barIn,
                  label: t("dashboard.cashIn", "Tiền vào (Thu)"),
                },
                {
                  data: cashOut,
                  color: barOut,
                  label: t("dashboard.cashOut", "Tiền ra (Chi)"),
                },
              ]}
            />
          ) : isLoading ? (
            <ChartSkeleton type="bar" />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
              {t("common.noData", "Chưa có dữ liệu")}
            </div>
          )}
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
    </div>
  );
}
