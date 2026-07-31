import { Chart } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
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
  }>;
  yMax?: number;
  yCallback?: (v: number | string) => string;
  onClick?: (datasetIndex: number, index: number, label: string) => void;
}

export function BarChart({
  labels,
  datasets,
  yMax,
  yCallback,
  onClick,
}: BarChartProps) {
  const { gridColor, tickColor } = useChartTheme();
  return (
    <Chart
      type="bar"
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
          borderRadius: 4,
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
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += yCallback
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
            grid: { display: false },
            ticks: { font: { size: 11 }, color: tickColor },
          },
          y: {
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
        },
      }}
    />
  );
}
