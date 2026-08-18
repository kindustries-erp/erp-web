import React, { useState, useMemo } from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export interface DrawerRelatedTabItem {
  /** Mã định danh duy nhất của tab */
  key: string;
  /** Tiêu đề hiển thị của tab */
  label: string;
  /** Icon tuỳ chọn ở đầu tab */
  icon?: React.ReactNode;
  /** Số lượng bản ghi hiển thị trên badge */
  badgeCount?: number;
  /** Biến thể màu cho badge */
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  /** Nội dung render khi tab được kích hoạt */
  content: React.ReactNode;
  /** Nút hoặc element bổ sung ở góc phải của tab */
  headerExtra?: React.ReactNode;
  /** Bật chế độ tràn viền (p-0 overflow-hidden), thích hợp cho Canvas Graph, Full-width Table */
  flush?: boolean;
  /** Tùy chỉnh class cho Card Container của tab */
  cardClassName?: string;
  /** Tắt Card Container nếu tab tự quản lý container riêng */
  noCard?: boolean;
}

export interface DrawerRelatedDeckProps {
  /** Danh sách các tab thông tin liên quan */
  tabs?: DrawerRelatedTabItem[];
  /** Tab được kích hoạt mặc định */
  defaultTabKey?: string;
  /** Trạng thái thu gọn mặc định */
  defaultCollapsed?: boolean;
  /** Custom hoàn toàn nội dung thay vì dùng tab */
  customContent?: React.ReactNode;
  /** Tiêu đề thanh phân cách nếu dùng custom content */
  customTitle?: React.ReactNode;
  /** Callback khi chuyển tab */
  onTabChange?: (tabKey: string) => void;
  /** Cho phép tìm kiếm nhanh trong vùng liên quan */
  enableSearch?: boolean;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
  /** Callback khi thay đổi từ khóa tìm kiếm */
  onSearchChange?: (query: string) => void;
  /** ClassName bổ sung cho toàn deck */
  className?: string;
  /** ClassName bổ sung cho card container */
  cardClassName?: string;
}

export function DrawerRelatedDeck({
  tabs = [],
  defaultTabKey,
  defaultCollapsed = false,
  customContent,
  customTitle,
  onTabChange,
  enableSearch = false,
  searchPlaceholder,
  onSearchChange,
  className,
  cardClassName,
}: DrawerRelatedDeckProps) {
  const t = useT();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const deckRef = React.useRef<HTMLDivElement>(null);

  const activeTabKey = useMemo(() => {
    if (defaultTabKey && tabs.some((t) => t.key === defaultTabKey)) {
      return defaultTabKey;
    }
    return tabs.length > 0 ? tabs[0].key : "";
  }, [defaultTabKey, tabs]);

  const [currentTab, setCurrentTab] = useState(activeTabKey);

  // Sync currentTab if tabs change or defaultTabKey changes
  React.useEffect(() => {
    if (activeTabKey && !tabs.some((t) => t.key === currentTab)) {
      setCurrentTab(activeTabKey);
    }
  }, [activeTabKey, currentTab, tabs]);

  const scrollToDeck = () => {
    setTimeout(() => {
      if (deckRef.current) {
        deckRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
  };

  const handleTabClick = (key: string) => {
    setCurrentTab(key);
    if (collapsed) {
      setCollapsed(false);
    }
    onTabChange?.(key);
    scrollToDeck();
  };

  const handleToggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (!nextState) {
      scrollToDeck();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  const activeTabItem = tabs.find((item) => item.key === currentTab);

  if (!customContent && tabs.length === 0) {
    return null;
  }

  const isNoCard = activeTabItem?.noCard;
  const isFlush = activeTabItem?.flush;
  const effectiveContent = customContent
    ? customContent
    : activeTabItem?.content;

  return (
    <div
      ref={deckRef}
      className={cn(
        "mt-3 w-full flex flex-col transition-all duration-200 scroll-mt-2",
        className,
      )}
    >
      {/* ── Horizon Divider Bar (Clean, Minimal, Borderless Dock) ── */}
      <div className="relative flex items-center justify-between gap-2 py-1.5 border-t border-border/60">
        {/* Left: Tab list or Custom Title */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {customContent ? (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block" />
              {customTitle || t("Thông tin liên quan")}
            </div>
          ) : (
            tabs.map((tab) => {
              const isActive = currentTab === tab.key && !collapsed;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabClick(tab.key)}
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all select-none whitespace-nowrap",
                    isActive
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium",
                  )}
                >
                  {tab.icon && (
                    <span
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isActive
                          ? "text-white dark:text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full transition-all",
                        isActive
                          ? "bg-white text-slate-900 dark:bg-primary-foreground dark:text-primary shadow-xs"
                          : "bg-muted text-muted-foreground group-hover:bg-muted-hover group-hover:text-foreground",
                        tab.badgeVariant === "danger" &&
                          "bg-red-500/20 text-red-600",
                        tab.badgeVariant === "warning" &&
                          "bg-amber-500/20 text-amber-700",
                      )}
                    >
                      {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Right: Controls (Search, HeaderExtra, Collapse Toggle) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {enableSearch && (
            <div className="relative flex items-center">
              {showSearchInput ? (
                <div className="flex items-center bg-surface border border-border rounded-md px-2 py-0.5 shadow-xs transition-all w-40">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mr-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder || t("Tìm nhanh...")}
                    className="w-full text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        onSearchChange?.("");
                      }}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearchInput(false);
                      setSearchQuery("");
                      onSearchChange?.("");
                    }}
                    className="text-muted-foreground hover:text-foreground ml-1 p-0.5"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowSearchInput(true)}
                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                  title={t("Tìm kiếm")}
                >
                  <Search className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}

          {activeTabItem?.headerExtra}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleCollapse}
            className="text-muted-foreground hover:text-foreground h-7 w-7"
            title={collapsed ? t("Mở rộng") : t("Thu gọn")}
          >
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Content Sub-Deck (Standard Deck Card Container with card-shadow & frosted glass) ── */}
      {!collapsed &&
        (isNoCard ? (
          <div className="w-full pt-2 pb-1 transition-all">
            {effectiveContent}
          </div>
        ) : (
          <div
            data-testid="drawer-deck-card-container"
            className={cn(
              "w-full mt-2 rounded-xl border border-border/80 card-shadow transition-all",
              isFlush ? "p-0 overflow-hidden" : "p-3.5",
              cardClassName,
              activeTabItem?.cardClassName,
            )}
            style={{
              background: "var(--drawer-section-bg, rgba(255,255,255,0.65))",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
            }}
          >
            {effectiveContent}
          </div>
        ))}
    </div>
  );
}
