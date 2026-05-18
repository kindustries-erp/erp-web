import { Doughnut } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  items: DonutItem[];
  cutout?: string;
}

export function DonutChart({ items, cutout = "65%" }: DonutChartProps) {
  const { borderColor } = useChartTheme();
  return (
    <Doughnut
      data={{
        labels: items.map((x) => x.label),
        datasets: [
          {
            data: items.map((x) => x.value),
            backgroundColor: items.map((x) => x.color),
            borderWidth: 2,
            borderColor,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: { legend: { display: false } },
      }}
    />
  );
}

export function DonutLegend({ items }: { items: DonutItem[] }) {
  return (
    <div className="mt-[10px] flex flex-col gap-[5px]">
      {items.map((x) => (
        <div
          key={x.label}
          className="flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-[6px] text-[color:var(--muted-fg)]">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: x.color }}
            />
            {x.label}
          </div>
          <div className="text-[color:var(--muted-fg)]">{x.value}%</div>
        </div>
      ))}
    </div>
  );
}
