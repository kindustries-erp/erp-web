import { Doughnut } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { useChartTheme } from "@/shared/utils/chartTheme";
import { cn } from "@/shared/utils";

interface DonutItem {
  id?: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  items: DonutItem[];
  cutout?: string;
  onClick?: (item: DonutItem) => void;
}

export function DonutChart({
  items,
  cutout = "65%",
  onClick,
}: DonutChartProps) {
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
        onClick: (event, elements) => {
          if (onClick && elements && elements.length > 0) {
            const index = elements[0].index;
            onClick(items[index]);
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed !== null) {
                  label += context.parsed + "%";
                }
                return label;
              },
            },
          },
        },
      }}
    />
  );
}

export function DonutLegend({
  items,
  onClick,
}: {
  items: DonutItem[];
  onClick?: (item: DonutItem) => void;
}) {
  return (
    <div className="mt-[10px] flex flex-col gap-[5px]">
      {items.map((x) => (
        <div
          key={x.label}
          className={cn(
            "flex items-center justify-between text-xs",
            onClick &&
              "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md px-1 -mx-1",
          )}
          onClick={() => onClick?.(x)}
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
