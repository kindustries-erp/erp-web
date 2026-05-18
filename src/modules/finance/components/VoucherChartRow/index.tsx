import { Panel } from "@/shared/components/Panel";
import { LineChart } from "@/shared/components/charts/LineChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { DonutSkeleton } from "@/shared/components/DonutSkeleton";

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface VoucherChartRowProps {
  openingLoading: boolean;
  donutLoading: boolean;
  chartData: number[];
  chartLabels: string[];
  chartYMax: number;
  chartUnit: "M" | "B";
  receiptDonutItems: DonutItem[];
  paymentDonutItems: DonutItem[];
  balanceTrendTitle: string;
  incomeStructureTitle: string;
  expenseStructureTitle: string;
}

/**
 * VoucherChartRow — Organism: hàng biểu đồ gồm LineChart + 2 DonutChart.
 * Dùng chung cho TienMat và TienGui.
 */
export function VoucherChartRow({
  openingLoading,
  donutLoading,
  chartData,
  chartLabels,
  chartYMax,
  chartUnit,
  receiptDonutItems,
  paymentDonutItems,
  balanceTrendTitle,
  incomeStructureTitle,
  expenseStructureTitle,
}: VoucherChartRowProps) {
  return (
    <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-3 mb-4">
      <Panel title={balanceTrendTitle}>
        <div className="relative h-[175px]">
          {openingLoading ? (
            <ChartSkeleton />
          ) : (
            <LineChart
              labels={chartLabels}
              datasets={[{ data: chartData, color: "#1a1a1a" }]}
              yMax={chartYMax}
              yCallback={(v) => `${v}${chartUnit}`}
            />
          )}
        </div>
      </Panel>
      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-3">
        <Panel title={incomeStructureTitle}>
          {donutLoading ? (
            <DonutSkeleton />
          ) : (
            <>
              <div className="relative h-[130px]">
                <DonutChart items={receiptDonutItems} />
              </div>
              <DonutLegend items={receiptDonutItems} />
            </>
          )}
        </Panel>
        <Panel title={expenseStructureTitle}>
          {donutLoading ? (
            <DonutSkeleton />
          ) : (
            <>
              <div className="relative h-[130px]">
                <DonutChart items={paymentDonutItems} />
              </div>
              <DonutLegend items={paymentDonutItems} />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
