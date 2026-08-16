import { useEffect, useRef, useCallback } from "react";
import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Search } from "lucide-react";
import { useNavItems } from "./hooks/useNavItems";
import { useUniversalSearch } from "./hooks/useUniversalSearch";
import type { NavSearchItem } from "./hooks/useNavItems";

interface UniversalSearchModalProps {
  open: boolean;
  onClose: () => void;
  navTo: (p: PageKey) => void;
}

export function UniversalSearchModal({
  open,
  onClose,
  navTo,
}: UniversalSearchModalProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const allItems = useNavItems();

  const handleSelect = useCallback(
    (key: PageKey) => {
      navTo(key);
      onClose();
    },
    [navTo, onClose],
  );

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  } = useUniversalSearch(allItems, handleSelect);

  // Auto focus and reset query on modal open
  useEffect(() => {
    if (open) {
      setQuery("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, setQuery]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        hideCloseButton
        hideOverlay
        className={cn(
          "top-[15vh] translate-y-0 p-0 max-w-[560px] overflow-hidden rounded-2xl",
          "border border-[color:var(--popup-border)]",
        )}
      >
        <DialogTitle className="sr-only">
          {t("nav.universalSearch.placeholder")}
        </DialogTitle>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--popup-border)] bg-transparent">
          <Search className="w-4 h-4 text-[color:var(--muted-fg)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("nav.universalSearch.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-[color:var(--muted-fg)]"
          />
          <kbd className="text-[10px] text-[color:var(--faint)] border border-[color:var(--popup-border)] rounded px-1.5 py-0.5 font-mono select-none">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-[color:var(--muted-fg)]">
              {t("nav.universalSearch.noResults")}
            </div>
          ) : (
            results.map((item: NavSearchItem, idx: number) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors select-none",
                    isSelected
                      ? "bg-black/5 dark:bg-white/10 text-foreground font-medium"
                      : "text-[color:var(--muted-fg)] hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground",
                  )}
                  onClick={() => handleSelect(item.key)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="flex-shrink-0 opacity-70">{item.icon}</span>
                  <span className="flex-1 truncate flex items-baseline gap-1.5 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.group && (
                      <span className="text-[11px] text-[color:var(--muted-fg)]/60 font-normal truncate">
                        • {item.group}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[color:var(--faint)] uppercase tracking-wider font-semibold flex-shrink-0">
                    {item.section}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[color:var(--popup-border)] text-[10px] text-[color:var(--faint)] bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span>↑↓ {t("nav.universalSearch.hintNavigate")}</span>
            <span>↵ {t("nav.universalSearch.hintOpen")}</span>
          </div>
          <span>Esc {t("nav.universalSearch.hintClose")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
