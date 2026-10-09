import * as React from "react";
import { Line } from "react-chartjs-2";
import { V2ChartFrame } from "@/v2/shared/components/molecules/v2-chart-frame";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  buildLineData,
  buildLineOptions,
  defaultFormat,
  prepareSeries,
} from "./V2Chart.options";
import { registerV2Chart } from "./V2Chart.setup";
import type { V2LineChartProps } from "./V2Chart.type";

registerV2Chart();

export const V2LineChart: React.FC<V2LineChartProps> = ({
  labels,
  series,
  area = false,
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
      <Line
        data={buildLineData(
          labels,
          prepared.series,
          prepared.colors,
          theme,
          area,
        )}
        options={buildLineOptions(theme, formatValue)}
      />
    </V2ChartFrame>
  );
};
V2LineChart.displayName = "V2LineChart";
