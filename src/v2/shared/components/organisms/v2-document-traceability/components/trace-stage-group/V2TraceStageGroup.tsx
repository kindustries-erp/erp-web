import React, { useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceStageFlowNode } from "../../types/traceability.flow.type";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

/** Khung nền một giai đoạn trên canvas, kèm nút thêm liên kết khi được phép sửa */
export const V2TraceStageGroup = React.memo(function V2TraceStageGroup({
  data,
}: NodeProps<TraceStageFlowNode>) {
  const { t } = useV2Translation();
  const { stage, count, allowEdit, allowedDocTypes, actions } = data;
  const stageName = t(stage.titleKey);

  const addableTypes = useMemo(
    () =>
      allowedDocTypes
        ? stage.types.filter((type) => allowedDocTypes.includes(type))
        : stage.types,
    [stage.types, allowedDocTypes],
  );
  const canAdd = Boolean(
    allowEdit && actions.onAddLink && addableTypes.length > 0,
  );

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-2xl border-2 border-dashed pointer-events-none",
        stage.accentBorder,
        stage.bgCls,
      )}
    >
      <div className="pointer-events-auto absolute left-3.5 right-3.5 top-2.5 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <V2Text
            as="span"
            className={cn(
              "rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
              stage.badgeCls,
            )}
          >
            {t(stage.shortTitleKey)}
          </V2Text>
          <V2Text
            as="span"
            className="font-mono text-[11px] font-medium text-muted-fg "
          >
            ({count})
          </V2Text>
        </div>

        {canAdd && (
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-6 gap-1 border border-border bg-surface/80 px-2 text-[11px] text-muted-fg shadow-2xs hover:bg-surface hover:text-foreground  "
            title={t("v2.traceability.stage.addLinkTo", { stage: stageName })}
            onClick={() =>
              actions.onAddLink?.(
                stage.key,
                addableTypes.length === 1 ? addableTypes[0] : undefined,
              )
            }
          >
            <Plus className="h-3 w-3" />
            <V2Text as="span">{t("v2.traceability.stage.addLink")}</V2Text>
          </V2Button>
        )}
      </div>
    </div>
  );
});
