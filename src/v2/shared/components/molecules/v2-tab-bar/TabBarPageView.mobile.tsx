import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
  V2Icon,
  V2Text,
} from "@/v2/shared/components/atoms";
import { ChevronDown } from "@/v2/shared/components/atoms/v2-icon/icons";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TabBarPageViewProps } from "./TabBarPageView.desktop";
import { TabBarPageViewSheet } from "./TabBarPageView.sheet";

export const TabBarPageViewMobile: React.FC<TabBarPageViewProps> = ({
  tabs,
  activeKey,
  onSelect,
  extra,
  className,
  ariaLabel,
}) => {
  const { t } = useV2Translation();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const activeTab =
    tabs.find((tab) => (tab.key ?? tab.id) === activeKey) ?? tabs[0];

  const renderActiveIcon = () => {
    const icon = activeTab?.icon;
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || typeof icon === "object") {
      return (
        <V2Icon
          icon={icon as React.ComponentType<{ className?: string }>}
          size={15}
        />
      );
    }
    return null;
  };

  return (
    <>
      <div
        aria-label={ariaLabel || t("v2.tabBar.pageAriaLabel", "Tab trang")}
        className={cn(
          "flex w-full items-center justify-between gap-2",
          className,
        )}
      >
        <V2Button
          type="button"
          variant="outline"
          data-testid="v2-tab-bar-mobile-trigger"
          onClick={() => setSheetOpen(true)}
          className="h-11 min-w-0 flex-1 justify-between gap-2 rounded-xl border-border/70 bg-card px-3 text-foreground shadow-xs hover:bg-surface/80 active:scale-[0.98]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {renderActiveIcon()}
            <V2Text
              as="span"
              variant="body-sm"
              weight="semibold"
              truncate
              className="text-foreground"
            >
              {activeTab?.label}
            </V2Text>
            {activeTab?.badgeCount !== undefined &&
              activeTab.badgeCount > 0 && (
                <V2Badge
                  variant={V2BadgeVariant.SECONDARY}
                  size={V2BadgeSize.XS}
                  className="rounded-full px-1.5 py-0 font-mono text-[10px] leading-none shrink-0"
                >
                  {activeTab.badgeCount > 99 ? "99+" : activeTab.badgeCount}
                </V2Badge>
              )}
          </div>
          <V2Icon
            icon={ChevronDown}
            size={15}
            className="shrink-0 text-muted-fg"
          />
        </V2Button>
        {extra && (
          <div className="flex shrink-0 items-center gap-2">{extra}</div>
        )}
      </div>

      <TabBarPageViewSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tabs={tabs}
        activeKey={activeKey}
        onSelect={onSelect}
      />
    </>
  );
};
