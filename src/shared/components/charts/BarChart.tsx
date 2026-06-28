import { Bar } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";

interface BarChartProps {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: string;
    label?: string;
  }>;
  yMax?: number;
  yCallback?: (v: number | string) => string;
}

export function BarChart({ labels, datasets, yMax, yCallback }: BarChartProps) {
  const { gridColor, tickColor } = useChartTheme();
  return (
    <Bar
      data={{
        labels,
        datasets: datasets.map((d) => ({
          label: d.label ?? "",
          data: d.data,
          backgroundColor: d.color,
          borderRadius: 4,
          barPercentage: 0.45,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
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
