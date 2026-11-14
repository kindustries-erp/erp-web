import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { TabBarPageViewMobile } from "./TabBarPageView.mobile";
import type { V2TabItemData } from "./V2TabBar.type";

export interface TabBarPagePillViewProps {
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  primary: "bg-primary",
};

function renderTabIcon(icon: V2TabItemData["icon"]) {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return <span className="shrink-0">{icon}</span>;
  }
  const IconComp = icon as React.ElementType;
  return <IconComp className="h-3.5 w-3.5 shrink-0" />;
}

/** Thanh tab dạng nút pill bo góc kèm đường kẻ mảnh phân tách nội dung phía dưới. */
export const TabBarPagePillView: React.FC<TabBarPagePillViewProps> = ({
  tabs,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();

  if (isMobile) {
    return (
      <TabBarPageViewMobile
        tabs={tabs}
        activeKey={activeKey}
        onSelect={onSelect}
        extra={extra}
        className={className}
        ariaLabel={ariaLabel}
      />
    );
  }

  return (
    <div
      role="tablist"
      data-variant="pill"
      aria-label={ariaLabel || t("v2.tabBar.pageAriaLabel", "Tab trang")}
      className={cn(
        "flex w-full items-center justify-between gap-2 border-b border-border/60 dark:border-white/[0.06] pb-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden touch-pan-x scrollbar-none [-webkit-overflow-scrolling:touch]">
        {tabs.map((tab) => {
          const key = (tab.key ?? tab.id) || "";
          const active = key === activeKey;
          return (
            <V2Button
              key={key}
              type="button"
              role="tab"
              variant="ghost"
              disabled={tab.disabled}
              aria-selected={active}
              data-active={active ? "true" : "false"}
              data-state={active ? "active" : "inactive"}
              onClick={() => !tab.disabled && onSelect(key)}
              className={cn(
                "min-h-[44px] sm:min-h-0 sm:h-9 px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm whitespace-nowrap shrink-0 gap-1.5 shadow-none transition-colors",
                active
                  ? "bg-primary text-primary-fg font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-fg dark:bg-teal-500/20 dark:border dark:border-teal-500/40 dark:text-teal-300 dark:hover:bg-teal-500/25 dark:hover:text-teal-200"
                  : "bg-transparent text-muted-fg hover:text-foreground hover:bg-muted/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.04] font-medium",
                tab.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {(active || tab.alwaysShowIcon) && renderTabIcon(tab.icon)}
              <span>{tab.label}</span>
              {tab.dot && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full inline-block",
                    DOT_COLORS[tab.dotColor || "emerald"] || "bg-emerald-500",
                  )}
                />
              )}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <V2Badge
                  variant={
                    active ? V2BadgeVariant.SECONDARY : V2BadgeVariant.OUTLINE
                  }
                  size={V2BadgeSize.XS}
                  className="rounded-full px-1.5 py-0 font-mono text-[10px] leading-none shrink-0"
                >
                  {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                </V2Badge>
              )}
            </V2Button>
          );
        })}
      </div>
      {extra && <div className="flex shrink-0 items-center gap-2">{extra}</div>}
    </div>
  );
};
TabBarPagePillView.displayName = "TabBarPagePillView";
