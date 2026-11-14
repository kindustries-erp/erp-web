import * as React from "react";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
  V2Icon,
  V2Text,
} from "@/v2/shared/components/atoms";
import { Check, Layers } from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TabItemData } from "./V2TabBar.type";

export interface TabBarPageViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabs: V2TabItemData[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const TabBarPageViewSheet: React.FC<TabBarPageViewSheetProps> = ({
  open,
  onOpenChange,
  tabs,
  activeKey,
  onSelect,
}) => {
  const { t } = useV2Translation();

  const renderTabIcon = (icon: V2TabItemData["icon"]) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || typeof icon === "object") {
      return (
        <V2Icon
          icon={icon as React.ComponentType<{ className?: string }>}
          size={16}
        />
      );
    }
    return null;
  };

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("v2.table.selectTabTitle", "Chuyển danh mục")}
      subtitle={t("v2.table.selectTabSubtitle", "Chọn mục bạn muốn xem")}
      icon={<V2Icon icon={Layers} size={16} />}
      maxHeightClass="max-h-[85dvh] h-auto"
      bodyClassName="p-4 flex flex-col gap-2 overflow-y-auto"
      footer={
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <V2Button
            type="button"
            variant="outline"
            fullWidth
            className="h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            {t("v2.common.close", "Đóng")}
          </V2Button>
        </div>
      }
    >
      <div role="tablist" className="flex flex-col gap-2">
        {tabs.map((tab) => {
          const key = (tab.key ?? tab.id) || "";
          const active = key === activeKey;
          return (
            <V2Button
              key={key}
              type="button"
              role="tab"
              variant="outline"
              disabled={tab.disabled}
              aria-selected={active}
              onClick={() => {
                if (tab.disabled) return;
                onSelect(key);
                onOpenChange(false);
              }}
              className={cn(
                "h-12 w-full justify-between rounded-xl px-3.5 text-left shadow-none",
                active
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15 hover:text-primary"
                  : "border-border/70 bg-card hover:bg-surface/80 text-foreground",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {renderTabIcon(tab.icon)}
                <V2Text
                  as="span"
                  variant="body-sm"
                  weight={active ? "semibold" : "medium"}
                  truncate
                  className={active ? "text-primary" : "text-foreground"}
                >
                  {tab.label}
                </V2Text>
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
              </div>
              {active && <V2Icon icon={Check} size={16} className="shrink-0" />}
            </V2Button>
          );
        })}
      </div>
    </V2BottomSheet>
  );
};
