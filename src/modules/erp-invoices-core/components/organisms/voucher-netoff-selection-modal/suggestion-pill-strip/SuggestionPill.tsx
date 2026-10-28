import React, { useRef } from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { Check } from "lucide-react";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { BADGE_CONFIG_MAP } from "@/modules/erp-invoices-core/components/molecules/smart-suggestion-card/SmartSuggestionCard.type";
import type { SmartNetOffSuggestionItem } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useHoverIntent } from "./useHoverIntent";
import { SuggestionPopoverContent } from "./SuggestionPopoverContent";

export interface SuggestionPillProps {
  suggestion: SmartNetOffSuggestionItem;
  selected: boolean;
  onToggle: (txn: SmartNetOffSuggestionItem["txn"]) => void;
  currentRemaining?: number;
  onViewDetail?: (id: string) => void;
}

export function SuggestionPill({
  suggestion,
  selected,
  onToggle,
  currentRemaining,
  onViewDetail,
}: SuggestionPillProps) {
  const { txn, score } = suggestion;
  const { open, onEnter, onLeave, close } = useHoverIntent();
  // Focus do chuột bấm không mở popover; chỉ focus bằng bàn phím mới mở
  const pointerFocus = useRef(false);
  const cfg = BADGE_CONFIG_MAP[score.badge];
  const amount = txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;

  return (
    <RadixPopover.Root
      open={open}
      onOpenChange={(next) => (next ? onEnter() : close())}
    >
      <RadixPopover.Anchor asChild>
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onToggle(txn)}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onMouseDown={() => {
            pointerFocus.current = true;
          }}
          onFocus={() => {
            if (!pointerFocus.current) onEnter();
          }}
          onBlur={() => {
            pointerFocus.current = false;
            onLeave();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 shrink-0 h-8 px-3 rounded-full border text-xs whitespace-nowrap cursor-pointer transition-colors select-none",
            selected
              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
          )}
        >
          {selected ? (
            <Check className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                cfg?.dotClasses,
              )}
            />
          )}
          <span className="font-mono font-semibold">{money(amount)}</span>
          <span className="font-mono text-[10px] opacity-70">
            {formatGMT7(txn.transDate, "date").slice(0, 5)}
          </span>
          <span className="max-w-[140px] truncate opacity-80">
            {txn.correspondentName || txn.referenceNumber || "—"}
          </span>
          <span className="font-mono text-[10px] opacity-60">
            {score.score}%
          </span>
        </button>
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={close}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="z-[9999] rounded-xl border border-border/80 bg-popover shadow-2xl outline-none"
        >
          <SuggestionPopoverContent
            suggestion={suggestion}
            currentRemaining={currentRemaining}
            onViewDetail={onViewDetail}
          />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
