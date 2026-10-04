import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/v2/shared/ui";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { DeckBadge } from "./DeckBadge";
import type { DrawerRelatedDeckProps } from "./DrawerRelatedDeck.type";

export const DrawerRelatedDeck: React.FC<DrawerRelatedDeckProps> = ({
  tabs = [],
  defaultTabKey,
  defaultCollapsed = false,
  customContent,
  customTitle,
  onTabChange,
  className,
  cardClassName,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const deckRef = useRef<HTMLDivElement>(null);

  const activeTabKey = useMemo(() => {
    if (defaultTabKey && tabs.some((t) => t.key === defaultTabKey))
      return defaultTabKey;
    return tabs.length > 0 ? tabs[0].key : "";
  }, [defaultTabKey, tabs]);

  const [currentTab, setCurrentTab] = useState(activeTabKey);

  useEffect(() => {
    if (activeTabKey && !tabs.some((t) => t.key === currentTab))
      setCurrentTab(activeTabKey);
  }, [activeTabKey, currentTab, tabs]);

  const scrollToDeck = () => {
    setTimeout(() => {
      deckRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const handleTabClick = (key: string) => {
    setCurrentTab(key);
    if (collapsed) setCollapsed(false);
    onTabChange?.(key);
    scrollToDeck();
  };

  const activeTab = tabs.find((item) => item.key === currentTab);
  if (!customContent && tabs.length === 0) return null;
  const content = customContent || activeTab?.content;

  return (
    <div
      ref={deckRef}
      className={cn(
        "mt-3 w-full flex flex-col transition-all duration-200 scroll-mt-2",
        className,
      )}
    >
      {/* Horizon Divider Bar */}
      <div className="relative flex items-center justify-between gap-2 py-1.5 border-t border-border/60">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none touch-pan-x py-0.5 min-w-0 flex-1 pr-2">
          {customContent ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              <V2Text
                variant="caption"
                className="font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {customTitle || "Thông tin liên quan"}
              </V2Text>
            </div>
          ) : (
            tabs.map((tab) => {
              const isActive = currentTab === tab.key && !collapsed;
              return (
                <V2Button
                  key={tab.key}
                  type="button"
                  variant="drawer-tab"
                  onClick={() => handleTabClick(tab.key)}
                  className={cn(
                    "cursor-pointer",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                  )}
                >
                  {tab.icon && (
                    <span
                      className={cn(
                        "w-3.5 h-3.5",
                        isActive ? "text-white" : "text-muted-foreground",
                      )}
                    >
                      {tab.icon}
                    </span>
                  )}
                  <V2Text
                    as="span"
                    variant="body-sm"
                    className={
                      isActive ? "text-inherit font-semibold" : "text-inherit"
                    }
                  >
                    {tab.label}
                  </V2Text>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <DeckBadge
                      count={tab.badgeCount}
                      variant={tab.badgeVariant}
                      isActive={isActive}
                    />
                  )}
                </V2Button>
              );
            })
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {activeTab?.headerExtra}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              if (!next) scrollToDeck();
            }}
            aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
            className="text-muted-foreground hover:text-foreground h-7 w-7 min-w-[28px] min-h-[28px]"
          >
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Sub-Deck */}
      {!collapsed &&
        (activeTab?.noCard ? (
          <div className="w-full pt-2 pb-1 transition-all">{content}</div>
        ) : (
          <div
            data-testid="drawer-deck-card-container"
            className={cn(
              "w-full mt-2 rounded-xl border border-border/80 card-shadow transition-all backdrop-blur-md",
              activeTab?.flush ? "p-0 overflow-hidden" : "p-2.5 sm:p-3.5",
              cardClassName,
              activeTab?.cardClassName,
            )}
            style={{
              background: "var(--drawer-section-bg, rgba(255,255,255,0.65))",
            }}
          >
            {content}
          </div>
        ))}
    </div>
  );
};
