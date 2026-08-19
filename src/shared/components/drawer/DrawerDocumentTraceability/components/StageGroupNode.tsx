import React, { useMemo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { StageGroupData } from "../types";

export function StageGroupNodeCard({ data }: NodeProps<Node<StageGroupData>>) {
  const t = useT();
  const group = data as StageGroupData;
  const { stage, count, width, height, allowEdit, onAddLink, allowedDocTypes } =
    group;

  const validStageTypes = useMemo(() => {
    if (!allowedDocTypes) return stage.types;
    return stage.types.filter((typ) => allowedDocTypes.includes(typ));
  }, [stage.types, allowedDocTypes]);

  const canAddInThisStage = Boolean(
    allowEdit && onAddLink && validStageTypes.length > 0,
  );

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={cn(
        "rounded-2xl border-2 border-dashed relative pointer-events-none transition-all",
        stage.accentBorder,
        stage.bgCls,
      )}
    >
      {/* Top Header of Swimlane / Stage Group */}
      <div className="absolute top-2.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider font-mono uppercase border",
              stage.badgeCls,
            )}
          >
            {stage.shortTitle}
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
            ({count})
          </span>
        </div>

        {canAddInThisStage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 bg-white/80 dark:bg-slate-800 hover:bg-white border border-slate-200 dark:border-slate-700 shadow-2xs gap-1"
            onClick={() =>
              onAddLink?.(
                stage.key,
                validStageTypes.length === 1 ? validStageTypes[0] : undefined,
              )
            }
            title={`${t("Ghép nối chứng từ vào")} ${stage.title}`}
          >
            <Plus className="w-3 h-3" />
            <span>{t("Thêm liên kết")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
