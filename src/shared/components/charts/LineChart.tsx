import { Line } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";

interface LineDataset {
  data: number[];
  color: string;
  label?: string;
  fill?: boolean;
  borderDash?: number[];
  borderWidth?: number;
  tension?: number;
  pointRadius?: number;
}

interface LineChartProps {
  labels: string[];
  datasets: LineDataset[];
  yMax?: number;
  showLegend?: boolean;
  yCallback?: (v: number | string) => string;
}

export function LineChart({
  labels,
  datasets,
  yMax,
  showLegend = false,
  yCallback,
}: LineChartProps) {
  const { gridColor, tickColor } = useChartTheme();
  return (
    <Line
      data={{
        labels,
        datasets: datasets.map((d) => ({
          label: d.label ?? "",
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.color.startsWith("#")
            ? d.color + "20"
            : d.color.replace("rgb", "rgba").replace(")", ", 0.12)"),
          fill: d.fill ?? false,
          tension: d.tension ?? 0.35,
          pointRadius: d.pointRadius ?? 3.5,
          pointBackgroundColor: d.color,
          borderWidth: d.borderWidth ?? 2,
          borderDash: d.borderDash,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
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
            min: 0,
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
