import * as React from "react";
import { Chart } from "react-chartjs-2";
import { V2ChartFrame } from "@/v2/shared/components/molecules/v2-chart-frame";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { defaultFormat } from "./V2Chart.options";
import {
  buildComboData,
  buildComboOptions,
  prepareComboSeries,
} from "./V2Chart.combo.options";
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
  onBarClick,
  onBarContextMenu,
}) => {
  const chartRef = React.useRef<any>(null);
  const theme = useV2ChartTheme();
  const prepared = React.useMemo(
    () => prepareComboSeries(series, theme),
    [series, theme],
  );
  const hasSecondary = React.useMemo(
    () => series.some((s) => s.secondaryAxis),
    [series],
  );

  const comboData = React.useMemo(
    () =>
      buildComboData(labels, prepared.series, prepared.colors, theme, stacked),
    [labels, prepared.series, prepared.colors, theme, stacked],
  );

  const comboOptions = React.useMemo(
    () =>
      buildComboOptions(
        theme,
        formatValue,
        stacked,
        hasSecondary,
        secondaryFormatValue,
        onBarClick,
      ),
    [
      theme,
      formatValue,
      stacked,
      hasSecondary,
      secondaryFormatValue,
      onBarClick,
    ],
  );

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onBarContextMenu) return;
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(
      e.nativeEvent,
      "index",
      { intersect: false },
      true,
    );
    if (elements && elements.length > 0) {
      e.preventDefault();
      onBarContextMenu(elements[0].index, elements[0].datasetIndex, e);
    }
  };

  return (
    <V2ChartFrame
      labels={labels}
      series={prepared.series}
      legend={prepared.series
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => !s.legendHidden)
        .map(({ s, i }) => ({
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
      <div onContextMenu={handleContextMenu} className="h-full w-full">
        <Chart
          ref={chartRef}
          type="bar"
          data={comboData}
          options={comboOptions}
        />
      </div>
    </V2ChartFrame>
  );
};
V2ComboChart.displayName = "V2ComboChart";
