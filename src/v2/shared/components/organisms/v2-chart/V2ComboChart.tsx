import * as React from "react";
import { Chart } from "react-chartjs-2";
import { V2ChartFrame } from "@/v2/shared/components/molecules/v2-chart-frame";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import {
  buildComboData,
  buildComboOptions,
  defaultFormat,
  prepareComboSeries,
} from "./V2Chart.options";
import { registerV2Chart } from "./V2Chart.setup";
import type { V2ComboChartProps } from "./V2Chart.type";

registerV2Chart();

export const V2ComboChart: React.FC<V2ComboChartProps> = ({
  labels,
  series,
  stacked = false,
  formatValue = defaultFormat,
  secondaryFormatValue,
  ariaLabel,
  loading,
  height,
  className,
}) => {
  const theme = useV2ChartTheme();
  const prepared = React.useMemo(
    () => prepareComboSeries(series, theme),
    [series, theme],
  );
  const hasSecondary = React.useMemo(
    () => series.some((s) => s.secondaryAxis),
    [series],
  );

  return (
    <V2ChartFrame
      labels={labels}
      series={prepared.series}
      legend={prepared.series.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: prepared.colors[i] as string,
        isLine: s.type === "line",
      }))}
      formatValue={formatValue}
      ariaLabel={ariaLabel}
      loading={loading}
      height={height}
      className={className}
    >
      <Chart
        type="bar"
        data={buildComboData(
          labels,
          prepared.series,
          prepared.colors,
          theme,
          stacked,
        )}
        options={buildComboOptions(
          theme,
          formatValue,
          stacked,
          hasSecondary,
          secondaryFormatValue,
        )}
      />
    </V2ChartFrame>
  );
};
V2ComboChart.displayName = "V2ComboChart";
