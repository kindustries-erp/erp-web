import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils";
import type { ChartTableSwitchProps } from "./ChartTableSwitch.type";

export const ChartTableSwitch = React.memo(function ChartTableSwitch({
  value,
  onChange,
  chartLabel,
  tableLabel,
  className,
  disabled = false,
}: ChartTableSwitchProps) {
  const { t } = useTranslation(["erpInvoices", "debts", "common"]);

  const resolvedChartLabel =
    chartLabel ?? t("debts:drawer.chartView", "Biểu đồ");
  const resolvedTableLabel =
    tableLabel ?? t("debts:drawer.tableView", "Bảng số liệu");

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-shrink-0 select-none",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs transition-colors cursor-pointer",
          value === "chart"
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50",
        )}
        onClick={() => !disabled && onChange("chart")}
      >
        {resolvedChartLabel}
      </span>
      <Switch
        checked={value === "table"}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked ? "table" : "chart")}
        aria-label={t(
          "debts:drawer.toggleChartView",
          "Chuyển đổi biểu đồ hoặc bảng số liệu",
        )}
      />
      <span
        className={cn(
          "text-xs transition-colors cursor-pointer",
          value === "table"
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
          disabled && "pointer-events-none opacity-50",
        )}
        onClick={() => !disabled && onChange("table")}
      >
        {resolvedTableLabel}
      </span>
    </div>
  );
});
