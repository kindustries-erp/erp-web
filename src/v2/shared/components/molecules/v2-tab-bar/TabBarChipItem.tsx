import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Divider, V2Text } from "@/v2/shared/components/atoms";
import type { V2TabItemData } from "./V2TabBar.type";
import { TabBarChipComfortable } from "./TabBarChipComfortable";
import { TabBarChipHeader } from "./TabBarChipHeader";
import { TabBarChipMetric } from "./TabBarChipMetric";
import { TabBarChipProgress } from "./TabBarChipProgress";

interface TabBarChipItemProps {
  tab: V2TabItemData;
  isActive: boolean;
  total: number;
  onSelect: (key: string) => void;
  density?: "compact" | "comfortable";
  metricMode?: "stacked" | "inline" | "icon";
  equalWidth?: boolean;
  indicator?: "active-bar" | "progress";
}

/** Thẻ trạng thái bấm được (V2TabBarVariant.STATUS_CHIP), 2 hàng tinh gọn, count trong ngoặc đơn */
export const TabBarChipItem: React.FC<TabBarChipItemProps> = ({
  tab,
  isActive,
  total,
  onSelect,
  density = "compact",
  metricMode = "stacked",
  equalWidth = true,
  indicator = "active-bar",
}) => {
  const tabKey = (tab.key ?? tab.id) || "";
  const tone = tab.tone ?? "neutral";
  const count = tab.badgeCount ?? 0;
  const pct =
    tab.percentage !== undefined
      ? tab.percentage
      : total > 0
        ? Math.min(100, Math.round((count / total) * 100))
        : 0;

  if (density === "comfortable") {
    return (
      <TabBarChipComfortable
        tab={tab}
        isActive={isActive}
        total={total}
        onSelect={onSelect}
      />
    );
  }

  const showProgressBar = indicator === "progress" && !tab.hideProgress;

  return (
    <V2Button
      type="button"
      role="tab"
      variant="ghost"
      disabled={tab.disabled}
      aria-selected={isActive}
      data-active={isActive ? "true" : "false"}
      data-state={isActive ? "active" : "inactive"}
      aria-controls={`status-chip-panel-${tabKey}`}
      id={`status-chip-tab-${tabKey}`}
      onClick={() => !tab.disabled && onSelect(tabKey)}
      className={cn(
        "group relative flex h-auto shrink-0 snap-start flex-col justify-center rounded-none text-left font-normal transition-colors duration-150 select-none cursor-pointer",
        "px-3 py-2 sm:px-3.5 sm:py-2.5",
        equalWidth
          ? "w-[136px] sm:w-[156px]"
          : "w-auto min-w-[120px] sm:min-w-[136px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isActive
          ? "bg-surface-hover shadow-xs"
          : "bg-transparent hover:bg-surface-hover",
        tab.disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Hàng 1: Dot + Tên trạng thái (Count) bên trái; Tỷ trọng % bên phải */}
      <TabBarChipHeader
        label={tab.label}
        tone={tone}
        pct={pct}
        total={total}
        isActive={isActive}
        badgeCount={tab.badgeCount !== undefined ? count : undefined}
      />

      {/* Hàng 2: Số liệu bên dưới căn giữa với divider ngăn cách giữa các metric */}
      <div className="mt-2 sm:mt-2.5 min-w-0 w-full">
        {tab.metrics && tab.metrics.length > 0 && (
          <span className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 w-full flex-nowrap overflow-hidden">
            {tab.metrics.map((m, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <V2Divider
                    orientation="vertical"
                    data-testid="tab-chip-metric-divider"
                    className="h-2.5 shrink-0 bg-muted-fg opacity-35"
                  />
                )}
                <TabBarChipMetric
                  metric={m}
                  showIconOnly={metricMode === "icon"}
                />
              </React.Fragment>
            ))}
          </span>
        )}
        {(!tab.metrics || tab.metrics.length === 0) && tab.subValue && (
          <span className="flex items-baseline gap-1.5 min-w-0">
            <V2Text
              as="span"
              variant="tab-pill"
              color="inherit"
              className="font-mono text-[11px] leading-tight text-muted-fg truncate"
            >
              {tab.subLabel ? `${tab.subLabel} ${tab.subValue}` : tab.subValue}
            </V2Text>
          </span>
        )}
      </div>

      {/* Progress bar tùy chọn nếu cần dùng (mặc định tắt khi dùng active-bar) */}
      {showProgressBar && (
        <div className="mt-2 sm:mt-2.5 w-full">
          <TabBarChipProgress
            pct={pct}
            tone={tone}
            hide={tab.hideProgress}
            label={tab.label}
          />
        </div>
      )}

      {/* Active Tab Bar: Thanh tím ở mép chân tab chỉ xuất hiện khi tab đang active */}
      {isActive && indicator === "active-bar" && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
        />
      )}
    </V2Button>
  );
};

TabBarChipItem.displayName = "TabBarChipItem";
