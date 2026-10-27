import React from "react";
import { Link2, Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { DOC_TYPE_META } from "../../constants/traceability.constants";
import type { TraceabilityNodeType } from "../../types/traceability.type";

export interface V2TraceLinkTypeMenuProps {
  /** Các loại chứng từ được phép ghép nối (đã lọc theo allowedDocTypes) */
  types: TraceabilityNodeType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: TraceabilityNodeType) => void;
}

/** Nút "Ghép nối chứng từ": một loại thì ghép ngay, nhiều loại thì mở danh sách chọn */
export function V2TraceLinkTypeMenu({
  types,
  open,
  onOpenChange,
  onSelect,
}: V2TraceLinkTypeMenuProps) {
  const { t } = useV2Translation();

  const trigger = (
    <V2Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 border-primary/30 bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10"
      onClick={types.length === 1 ? () => onSelect(types[0]) : undefined}
    >
      <Link2 className="h-3.5 w-3.5" />
      <span>{t("v2.traceability.toolbar.link")}</span>
    </V2Button>
  );

  if (types.length <= 1) return trigger;

  return (
    <V2Popover
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      align="end"
      trigger={trigger}
      content={
        <div className="min-w-[260px] p-2.5">
          <div className="mb-1.5 border-b border-slate-100 px-1 pb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("v2.traceability.toolbar.linkTypeTitle")}
          </div>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {types.map((type) => {
              const meta = DOC_TYPE_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelect(type)}
                  className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${meta.badgeCls}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
                      {t(meta.fullTitleKey)}
                    </span>
                  </span>
                  <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                </button>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
