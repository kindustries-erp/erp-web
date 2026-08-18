import React from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { Plus } from "lucide-react";
import type { TraceabilityNodeType } from "@/shared/types/traceability";
import { DOC_TYPE_META } from "../constants";

interface LinkSelectorPopoverProps {
  selectableDocTypes: TraceabilityNodeType[];
  onSelect: (docType: TraceabilityNodeType) => void;
}

export function LinkSelectorPopoverContent({
  selectableDocTypes,
  onSelect,
}: LinkSelectorPopoverProps) {
  const t = useT();

  return (
    <div className="p-2.5 min-w-[260px]">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 font-mono">
        {t("Chọn loại để ghép nối")}
      </div>
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {selectableDocTypes.map((type) => {
          const meta = DOC_TYPE_META[type] || {
            label: type,
            fullTitle: type,
            badgeCls: "bg-slate-100 text-slate-700",
          };
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
                    meta.badgeCls,
                  )}
                >
                  {meta.label}
                </span>
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                  {t(meta.fullTitle)}
                </span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
