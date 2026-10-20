import * as React from "react";
import { Doughnut } from "react-chartjs-2";
import { V2ChartFrame } from "@/v2/shared/components/molecules/v2-chart-frame";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { getV2SeriesColor } from "@/v2/shared/utils/v2ChartPalette";
import { defaultFormat } from "./V2Chart.options";
import {
  buildDonutData,
  buildDonutOptions,
  foldSlices,
} from "./V2Chart.donut.options";
import { registerV2Chart } from "./V2Chart.setup";
import type { V2DonutChartProps } from "./V2Chart.type";

registerV2Chart();

export const V2DonutChart: React.FC<V2DonutChartProps> = ({
  labels,
  values,
  formatValue = defaultFormat,
  ariaLabel,
  loading,
  height,
  className,
}) => {
  const theme = useV2ChartTheme();
  const { t } = useV2Translation();
  const folded = React.useMemo(
    () => foldSlices(labels, values, t("v2.chart.other", "Khác")),
    [labels, values, t],
  );
  const colors = React.useMemo(
    () => folded.values.map((_, i) => getV2SeriesColor(i, theme.mode)),
    [folded.values, theme.mode],
  );

  return (
    <V2ChartFrame
      labels={folded.labels}
      series={[{ key: "value", label: ariaLabel, data: folded.values }]}
      legend={folded.labels.map((label, i) => ({
        key: `${label}-${i}`,
        label,
        color: colors[i] as string,
      }))}
      formatValue={formatValue}
      ariaLabel={ariaLabel}
      loading={loading}
      height={height}
      className={className}
    >
      <Doughnut
        data={buildDonutData(folded.labels, folded.values, colors, theme)}
        options={buildDonutOptions(theme, formatValue)}
      />
    </V2ChartFrame>
  );
};
V2DonutChart.displayName = "V2DonutChart";
