import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text, V2Tooltip } from "@/v2/shared/components/atoms";
import type { V2TabMetric } from "./V2TabBar.type";

export interface TabBarChipMetricProps {
  metric: V2TabMetric;
  showIconOnly?: boolean;
}

function renderMetricIcon(icon: V2TabMetric["icon"]) {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  const IconComp = icon as React.ElementType;
  return <IconComp className="h-3 w-3" />;
}

/** Hiển thị một metric phụ kèm micro-icon và V2Tooltip giải thích */
export const TabBarChipMetric: React.FC<TabBarChipMetricProps> = ({
  metric,
  showIconOnly = false,
}) => {
  const content = (
    <span className="inline-flex items-center gap-1 min-w-0">
      {metric.icon && (
        <span className="shrink-0 text-muted-fg/80" aria-hidden="true">
          {renderMetricIcon(metric.icon)}
        </span>
      )}
      <V2Text
        as="span"
        variant="tab-pill"
        color="inherit"
        className={cn(
          "font-mono text-[11px] leading-tight tabular-nums truncate",
          metric.tone === "warning"
            ? "text-warn-fg"
            : metric.tone === "danger"
              ? "text-rose-500"
              : metric.tone === "success"
                ? "text-up-fg"
                : "text-muted-fg",
        )}
      >
        {!showIconOnly && metric.label
          ? `${metric.label}: ${metric.value}`
          : metric.value}
      </V2Text>
    </span>
  );

  const tooltipContent =
    metric.tooltip ||
    (metric.label ? `${metric.label}: ${metric.value}` : undefined);

  if (tooltipContent) {
    return (
      <V2Tooltip content={tooltipContent} side="top" delayDuration={150}>
        {content}
      </V2Tooltip>
    );
  }

  return content;
};

TabBarChipMetric.displayName = "TabBarChipMetric";
