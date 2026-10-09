import * as React from "react";
import { BarChart3, Table2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import { V2EmptyState } from "@/v2/shared/components/molecules/v2-empty-state";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ChartFrameProps } from "./V2ChartFrame.type";

const defaultFormat = (value: number) => value.toLocaleString("vi-VN");

/** Khung dùng chung cho biểu đồ: legend (từ 2 mục), chuyển giữa biểu đồ và bảng, trạng thái tải và rỗng */
export const V2ChartFrame: React.FC<V2ChartFrameProps> = ({
  labels,
  series,
  legend,
  formatValue = defaultFormat,
  ariaLabel,
  loading = false,
  height = 240,
  children,
  className,
}) => {
  const { t } = useV2Translation();
  const [view, setView] = React.useState<"chart" | "table">("chart");
  const empty = labels.length === 0 || series.every((s) => s.data.length === 0);

  if (loading) return <V2Skeleton className="w-full" style={{ height }} />;
  if (empty) return <V2EmptyState className="py-6" />;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        {legend.length >= 2 ? (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {legend.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <V2Button
            type="button"
            variant={view === "chart" ? "secondary" : "ghost"}
            size="xs"
            aria-pressed={view === "chart"}
            aria-label={t("v2.chart.viewChart", "Xem biểu đồ")}
            className="h-6 w-6 p-0"
            onClick={() => setView("chart")}
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </V2Button>
          <V2Button
            type="button"
            variant={view === "table" ? "secondary" : "ghost"}
            size="xs"
            aria-pressed={view === "table"}
            aria-label={t("v2.chart.viewTable", "Xem dạng bảng")}
            className="h-6 w-6 p-0"
            onClick={() => setView("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
          </V2Button>
        </div>
      </div>
      {view === "chart" ? (
        <div
          role="img"
          aria-label={ariaLabel}
          style={{ height }}
          className="relative w-full"
        >
          {children}
        </div>
      ) : (
        <div className="max-h-[360px] overflow-auto rounded-md border border-border">
          <table aria-label={ariaLabel} className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 font-medium">
                  {t("v2.chart.category", "Hạng mục")}
                </th>
                {series.map((s) => (
                  <th
                    key={s.key}
                    className="px-3 py-1.5 text-right font-medium"
                  >
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((label, row) => (
                <tr key={`${label}-${row}`} className="border-t border-border">
                  <td className="px-3 py-1.5">{label}</td>
                  {series.map((s) => (
                    <td
                      key={s.key}
                      className="px-3 py-1.5 text-right tabular-nums"
                    >
                      {s.data[row] === undefined
                        ? ""
                        : formatValue(s.data[row] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
V2ChartFrame.displayName = "V2ChartFrame";
