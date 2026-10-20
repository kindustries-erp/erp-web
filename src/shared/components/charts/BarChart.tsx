import { Chart } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { barDataLabelsPlugin } from "./barChartDataLabels";
import { useChartTheme } from "@/shared/utils/chartTheme";

interface BarChartProps {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: string;
    label?: string;
    type?: "bar" | "line";
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    stack?: string;
    /** Vẽ dataset theo trục Y phụ (bên phải). */
    secondaryAxis?: boolean;
    /** Định dạng giá trị cho tooltip và nhãn dữ liệu của riêng dataset. */
    format?: (v: number) => string;
  }>;
  stacked?: boolean;
  showLegend?: boolean;
  yMax?: number;
  /** Hiện nhãn giá trị (dataset có `format`) lên cột/điểm. */
  dataLabels?: boolean;
  /** Định dạng tick trục Y phụ (bật khi có dataset `secondaryAxis`). */
  secondaryCallback?: (v: number | string) => string;
  secondaryMin?: number;
  yCallback?: (v: number | string) => string;
  onClick?: (datasetIndex: number, index: number, label: string) => void;
}

export function BarChart({
  labels,
  datasets,
  stacked,
  showLegend = false,
  yMax,
  dataLabels,
  secondaryCallback,
  secondaryMin,
  yCallback,
  onClick,
}: BarChartProps) {
  const { gridColor, tickColor } = useChartTheme();
  const hasSecondary = datasets.some((d) => d.secondaryAxis);
  return (
    <Chart
      type="bar"
      plugins={dataLabels ? [barDataLabelsPlugin as any] : undefined}
      data={{
        labels,
        datasets: datasets.map((d) => ({
          type: d.type || "bar",
          label: d.label ?? "",
          data: d.data,
          backgroundColor: d.color,
          borderColor: d.borderColor || d.color,
          borderWidth: d.borderWidth,
          fill: d.fill,
          yAxisID: d.secondaryAxis ? "y1" : "y",
          dataLabelFormat: dataLabels ? d.format : undefined,
          stack: d.stack || (stacked ? "stack-0" : undefined),
          borderRadius: stacked ? 2 : 4,
          barPercentage: 0.45,
          tension: d.type === "line" ? 0 : undefined,
          pointRadius: d.type === "line" ? 4 : undefined,
          pointBackgroundColor:
            d.type === "line" ? d.borderColor || d.color : undefined,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        onClick: onClick
          ? (event, elements) => {
              if (elements.length > 0) {
                const element = elements[0];
                onClick(
                  element.datasetIndex,
                  element.index,
                  labels[element.index],
                );
              }
            }
          : undefined,
        plugins: {
          barDataLabels: { color: tickColor },
          legend: {
            display: showLegend,
            position: "top",
            align: "end",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
              font: { size: 11 },
              color: tickColor,
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  const own = datasets[context.datasetIndex]?.format;
                  label += own
                    ? own(context.parsed.y)
                    : yCallback
                      ? yCallback(context.parsed.y)
                      : context.parsed.y + "B";
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: Boolean(stacked),
            grid: { display: false },
            ticks: { font: { size: 11 }, color: tickColor },
          },
          y: {
            stacked: Boolean(stacked),
            grid: { color: gridColor },
            border: { display: false },
            beginAtZero: true,
            ...(yMax ? { max: yMax } : {}),
            ticks: {
              font: { size: 11 },
              color: tickColor,
              callback: yCallback ?? ((v) => v + "B"),
            },
          },
          ...(hasSecondary
            ? {
                y1: {
                  position: "right" as const,
                  grid: { drawOnChartArea: false },
                  border: { display: false },
                  beginAtZero: true,
                  min: secondaryMin,
                  ticks: {
                    font: { size: 11 },
                    color: tickColor,
                    callback: secondaryCallback ?? ((v: number | string) => v),
                  },
                },
              }
            : {}),
        },
      }}
    />
  );
}
