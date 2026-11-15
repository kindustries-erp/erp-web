import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2Button,
  V2Progress,
  V2Text,
  type V2ProgressTone,
} from "@/v2/shared/components/atoms";
import type { V2StatusChipTone, V2TabItemData } from "./V2TabBar.type";

interface TabBarChipItemProps {
  tab: V2TabItemData;
  isActive: boolean;
  /** Tổng để tính tỷ lệ thanh tiến độ (thường là số của tab "Tất cả") */
  total: number;
  onSelect: (key: string) => void;
}

/** Chấm nhãn: trang trí, không có atom chấm sẵn nên giữ span */
const DOT_CLASS: Record<V2StatusChipTone, string> = {
  neutral: "bg-faint",
  success: "bg-up-fg",
  muted: "bg-faint opacity-70",
  warning: "bg-warn-fg",
};

/** Map tone chip sang tone của V2Progress (atom dùng chung) */
const PROGRESS_TONE: Record<V2StatusChipTone, V2ProgressTone> = {
  neutral: "neutral",
  success: "emerald",
  muted: "neutral",
  warning: "amber",
};

const numberFormatter = new Intl.NumberFormat("vi-VN");

/** Thẻ KPI bấm được: nhãn + chấm, số lớn, thanh tỷ lệ so với tổng, gạch chân khi đang chọn */
export const TabBarChipItem: React.FC<TabBarChipItemProps> = ({
  tab,
  isActive,
  total,
  onSelect,
}) => {
  const tabKey = (tab.key ?? tab.id) || "";
  const tone = tab.tone ?? "neutral";
  const count = tab.badgeCount ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

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
        "group relative flex h-auto w-[148px] shrink-0 snap-start flex-col items-stretch gap-2 rounded-none px-4 py-3 text-left font-normal whitespace-normal transition-colors duration-150 select-none cursor-pointer sm:w-[164px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isActive ? "bg-surface-hover" : "bg-transparent hover:bg-surface-hover",
        tab.disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          data-tone={tone}
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
        />
        <V2Text
          as="span"
          variant="tab-pill"
          color="inherit"
          className={cn(
            "text-xs leading-none",
            isActive
              ? "font-semibold text-foreground"
              : "font-medium text-muted-fg group-hover:text-foreground",
          )}
        >
          {tab.label}
        </V2Text>
      </span>

      {tab.badgeCount !== undefined && (
        <V2Text
          as="span"
          variant="tab-pill"
          color="inherit"
          className="font-mono text-2xl font-semibold leading-none tabular-nums text-foreground"
        >
          {numberFormatter.format(count)}
        </V2Text>
      )}

      <V2Progress value={pct} tone={PROGRESS_TONE[tone]} />

      {isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
        />
      )}
    </V2Button>
  );
};

TabBarChipItem.displayName = "TabBarChipItem";
