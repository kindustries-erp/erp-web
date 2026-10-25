import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Dialog, DialogContent, DialogTitle } from "@/v2/shared/ui/dialog";
import { V2Input, V2Text } from "@/v2/shared/components/atoms";
import type {
  V2UniversalSearchViewProps,
  V2SearchItem,
} from "./V2UniversalSearchModal.type";

export const V2UniversalSearchModalDesktop: React.FC<
  V2UniversalSearchViewProps
> = ({
  open,
  onClose,
  query,
  setQuery,
  results,
  selectedIndex,
  setSelectedIndex,
  handleKeyDown,
  handleSelect,
  inputRef,
}) => {
  const { t } = useV2Translation();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        hideCloseButton
        hideOverlay
        style={{
          background: "var(--popup-bg, rgba(246, 248, 252, 0.72))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
        className={cn(
          "top-[15vh] translate-y-0 p-0 max-w-[560px] overflow-hidden rounded-2xl",
          "border border-[color:var(--popup-border,rgba(226,232,240,0.8))] dark:border-white/10 text-foreground",
          "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22),0_4px_16px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]",
          "dark:shadow-[0_20px_48px_-8px_rgba(0,0,0,0.65),0_4px_16px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)_inset]",
        )}
      >
        <DialogTitle className="sr-only">
          {t("v2.universalSearch.title", "Tìm kiếm toàn cục")}
        </DialogTitle>

        {/* Search Input Bar with V2Input atom */}
        <div className="px-3 py-2 border-b border-[color:var(--popup-border,rgba(226,232,240,0.6))] bg-transparent">
          <V2Input
            ref={inputRef}
            variant="search"
            size="md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(
              "v2.universalSearch.placeholder",
              "Tìm kiếm menu, tác vụ...",
            )}
            leftIcon={<Search className="w-4 h-4 text-muted-fg opacity-70" />}
            rightIcon={
              <kbd className="border border-[color:var(--popup-border,rgba(226,232,240,0.8))] rounded px-1.5 py-0.5 select-none inline-flex items-center">
                <V2Text
                  as="span"
                  variant="caption"
                  className="text-[10px] text-muted-fg/70 font-mono"
                >
                  {t("v2.universalSearch.escKey", "Esc")}
                </V2Text>
              </kbd>
            }
          />
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-fg">
              <V2Text variant="body-sm" color="muted">
                {t(
                  "v2.universalSearch.noResults",
                  "Không tìm thấy kết quả phù hợp",
                )}
              </V2Text>
            </div>
          ) : (
            results.map((item: V2SearchItem, idx: number) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-150 select-none",
                    isSelected
                      ? "bg-[color:var(--sidebar-active-bg,rgba(0,0,0,0.06))] dark:bg-white/12 shadow-xs"
                      : "text-muted-fg hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.04))] dark:hover:bg-[color:var(--sidebar-hover-bg,rgba(255,255,255,0.06))]",
                  )}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isSelected
                        ? "text-[color:var(--sidebar-active-fg,var(--foreground))] opacity-100"
                        : "opacity-65 text-muted-fg group-hover:opacity-100 group-hover:text-[color:var(--sidebar-hover-fg,var(--foreground))]",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate flex items-baseline gap-1.5 min-w-0">
                    <V2Text
                      as="span"
                      variant="body-sm"
                      truncate
                      className={cn(
                        "text-inherit font-inherit transition-colors",
                        isSelected
                          ? "!text-[color:var(--sidebar-active-fg,var(--foreground))] font-semibold opacity-100"
                          : "group-hover:text-[color:var(--sidebar-hover-fg,var(--foreground))]",
                      )}
                    >
                      {item.title}
                    </V2Text>
                    {item.group && (
                      <V2Text
                        as="span"
                        variant="caption"
                        className="text-muted-fg/60 font-normal truncate"
                      >
                        • {item.group}
                      </V2Text>
                    )}
                  </span>
                  {item.category && (
                    <V2Text
                      as="span"
                      variant="caption"
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-semibold flex-shrink-0 transition-colors",
                        isSelected
                          ? "text-[color:var(--sidebar-active-fg,var(--foreground))] opacity-90"
                          : "text-muted-fg/60 group-hover:text-[color:var(--sidebar-hover-fg,var(--foreground))] group-hover:opacity-80",
                      )}
                    >
                      {item.category}
                    </V2Text>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint with V2Text */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[color:var(--popup-border,rgba(226,232,240,0.6))] bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <V2Text as="span" variant="caption" className="text-muted-fg/80">
              ↑↓ {t("v2.universalSearch.hintNavigate", "di chuyển")}
            </V2Text>
            <V2Text as="span" variant="caption" className="text-muted-fg/80">
              ↵ {t("v2.universalSearch.hintOpen", "mở")}
            </V2Text>
          </div>
          <V2Text as="span" variant="caption" className="text-muted-fg/80">
            Esc {t("v2.universalSearch.hintClose", "đóng")}
          </V2Text>
        </div>
      </DialogContent>
    </Dialog>
  );
};
