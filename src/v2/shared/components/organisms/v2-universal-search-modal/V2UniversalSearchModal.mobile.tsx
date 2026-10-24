import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { V2Button, V2Input, V2Text } from "@/v2/shared/components/atoms";
import type {
  V2UniversalSearchViewProps,
  V2SearchItem,
} from "./V2UniversalSearchModal.type";

export const V2UniversalSearchModalMobile: React.FC<
  V2UniversalSearchViewProps
> = ({ open, onClose, query, setQuery, results, handleSelect, inputRef }) => {
  const { t } = useV2Translation();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        hideCloseButton
        style={{
          background: "var(--popup-bg, rgba(246, 248, 252, 0.72))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
        className={cn(
          "h-[88dvh] max-h-[88dvh] p-0 rounded-t-2xl flex flex-col",
          "border-t border-[color:var(--popup-border,rgba(226,232,240,0.8))] dark:border-t-white/10 text-foreground",
          "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22),0_4px_16px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]",
          "dark:shadow-[0_20px_48px_-8px_rgba(0,0,0,0.65),0_4px_16px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)_inset]",
        )}
      >
        <SheetTitle className="sr-only">
          {t("v2.universalSearch.title", "Tìm kiếm toàn cục")}
        </SheetTitle>

        {/* Drag handle / top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[color:var(--popup-border,rgba(226,232,240,0.6))]">
          <div className="w-8 h-1 rounded-full bg-muted-fg/20 mx-auto" />
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="p-1 h-auto rounded-full text-muted-fg hover:text-foreground"
            aria-label={t("v2.universalSearch.hintClose", "đóng")}
          >
            <X className="w-4 h-4" />
          </V2Button>
        </div>

        {/* Search Input Bar with V2Input atom */}
        <div className="px-3 py-2 border-b border-[color:var(--popup-border,rgba(226,232,240,0.6))] bg-transparent">
          <V2Input
            ref={inputRef}
            variant="search"
            size="md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "v2.universalSearch.placeholder",
              "Tìm kiếm menu, tác vụ...",
            )}
            leftIcon={<Search className="w-4 h-4 text-muted-fg opacity-70" />}
            rightIcon={
              query ? (
                <V2Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setQuery("")}
                  className="p-1 h-auto text-muted-fg hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </V2Button>
              ) : undefined
            }
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-fg">
              <V2Text variant="body-sm" color="muted">
                {t(
                  "v2.universalSearch.noResults",
                  "Không tìm thấy kết quả phù hợp",
                )}
              </V2Text>
            </div>
          ) : (
            results.map((item: V2SearchItem) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-sm transition-colors select-none",
                  "hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.04))] hover:text-[color:var(--sidebar-hover-fg,var(--foreground))]",
                  "active:bg-[color:var(--sidebar-active-bg,rgba(0,0,0,0.06))] dark:active:bg-white/12 active:text-[color:var(--sidebar-active-fg,var(--foreground))]",
                  "text-foreground",
                )}
                onClick={() => handleSelect(item)}
              >
                <span className="flex-shrink-0 opacity-75 group-hover:opacity-100 group-active:opacity-100 group-hover:text-[color:var(--sidebar-hover-fg,inherit)] group-active:text-[color:var(--sidebar-active-fg,inherit)] transition-colors">
                  {item.icon}
                </span>
                <span className="flex-1 truncate flex flex-col min-w-0">
                  <V2Text
                    as="span"
                    variant="body-sm"
                    truncate
                    className="font-medium text-inherit group-hover:text-[color:var(--sidebar-hover-fg,inherit)] group-active:text-[color:var(--sidebar-active-fg,inherit)] transition-colors"
                  >
                    {item.title}
                  </V2Text>
                  {item.group && (
                    <V2Text
                      as="span"
                      variant="caption"
                      className="text-muted-fg/70 truncate"
                    >
                      {item.group}
                    </V2Text>
                  )}
                </span>
                {item.category && (
                  <V2Text
                    as="span"
                    variant="caption"
                    className="text-[10px] text-muted-fg/60 uppercase tracking-wider font-semibold flex-shrink-0"
                  >
                    {item.category}
                  </V2Text>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
