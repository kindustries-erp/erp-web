import * as React from "react";
import { Bar } from "react-chartjs-2";
import { V2ChartFrame } from "@/v2/shared/components/molecules/v2-chart-frame";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  buildBarData,
  buildBarOptions,
  defaultFormat,
  prepareSeries,
} from "./V2Chart.options";
import { registerV2Chart } from "./V2Chart.setup";
import type { V2BarChartProps } from "./V2Chart.type";

registerV2Chart();

export const V2BarChart: React.FC<V2BarChartProps> = ({
  labels,
  series,
  stacked = false,
  horizontal = false,
  formatValue = defaultFormat,
  ariaLabel,
  loading,
  height,
  className,
}) => {
  const theme = useV2ChartTheme();
  const { t } = useV2Translation();
  const prepared = React.useMemo(
    () => prepareSeries(series, t("v2.chart.other", "Khác"), theme),
    [series, theme, t],
  );

  return (
    <V2ChartFrame
      labels={labels}
      series={prepared.series}
      legend={prepared.series.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: prepared.colors[i] as string,
      }))}
      formatValue={formatValue}
      ariaLabel={ariaLabel}
      loading={loading}
      height={height}
      className={className}
    >
      <Bar
        data={buildBarData(
          labels,
          prepared.series,
          prepared.colors,
          theme,
          stacked,
          horizontal,
        )}
        options={buildBarOptions(theme, formatValue, stacked, horizontal)}
      />
    </V2ChartFrame>
  );
};
V2BarChart.displayName = "V2BarChart";
