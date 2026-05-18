import { Line } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";

interface LineDataset {
  data: number[];
  color: string;
  label?: string;
  fill?: boolean;
}

interface LineChartProps {
  labels: string[];
  datasets: LineDataset[];
  yMax?: number;
  yCallback?: (v: number | string) => string;
}

export function LineChart({
  labels,
  datasets,
  yMax,
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
          fill: d.fill ?? true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: d.color,
          borderWidth: 2,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
