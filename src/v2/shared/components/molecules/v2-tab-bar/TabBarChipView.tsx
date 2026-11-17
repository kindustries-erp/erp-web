import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TabBarChipItem } from "./TabBarChipItem";
import type { V2TabItemData } from "./V2TabBar.type";

export interface TabBarChipViewProps {
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  density?: "compact" | "comfortable";
  metricMode?: "stacked" | "inline" | "icon";
  equalWidth?: boolean;
  indicator?: "active-bar" | "progress";
}

/**
 * Dải thẻ KPI bấm được (V2TabBarVariant.STATUS_CHIP).
 * Các thẻ nằm trong một khung chung có viền; khung chỉ rộng bằng nội dung (ít tab thì gọn,
 * không kéo full width). Khi số tab vượt chiều rộng thì cuộn ngang có snap; extra xuống hàng khi hẹp.
 * Mặc định mật độ `compact` cao ~48px tinh gọn; hỗ trợ `comfortable` cho thẻ KPI lớn.
 * Width các card mặc định bằng nhau 100% (`equalWidth = true`).
 * Tổng = số của tab đầu tiên ("Tất cả").
 */
export const TabBarChipView: React.FC<TabBarChipViewProps> = ({
  tabs,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
  density = "compact",
  metricMode = "stacked",
  equalWidth = true,
  indicator = "active-bar",
}) => {
  const { t } = useV2Translation();
  const total = tabs[0]?.badgeCount ?? 0;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center justify-between gap-3 select-none",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={
          ariaLabel || t("v2.tabBar.statusChipAriaLabel", "Lọc theo trạng thái")
        }
        className={cn(
          "inline-flex max-w-full min-w-0 snap-x snap-proximity items-stretch overflow-x-auto scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch] divide-x divide-border border border-border bg-surface shadow-xs",
          density === "compact" ? "rounded-lg" : "rounded-xl",
        )}
      >
        {tabs.map((tab: V2TabItemData) => {
          const tabKey = (tab.key ?? tab.id) || "";
          return (
            <TabBarChipItem
              key={tabKey}
              tab={tab}
              total={total}
              density={density}
              metricMode={metricMode}
              equalWidth={equalWidth}
              indicator={indicator}
              isActive={activeKey === tabKey}
              onSelect={onSelect}
            />
          );
        })}
      </div>
      {extra && (
        <div className="flex shrink-0 items-center gap-2 ml-auto">{extra}</div>
      )}
    </div>
  );
};

TabBarChipView.displayName = "TabBarChipView";
