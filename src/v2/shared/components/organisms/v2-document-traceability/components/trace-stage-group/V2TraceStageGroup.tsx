import React, { useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { BookOpen, CreditCard, Package, Plus, Receipt } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceStageFlowNode } from "../../types/traceability.flow.type";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

function getStageIcon(key: string) {
  switch (key) {
    case "ORDER_STOCK":
      return <Package className="h-3 w-3 opacity-90" />;
    case "INVOICE":
      return <Receipt className="h-3 w-3 opacity-90" />;
    case "PAYMENT":
      return <CreditCard className="h-3 w-3 opacity-90" />;
    case "GENERAL_LEDGER":
      return <BookOpen className="h-3 w-3 opacity-90" />;
    default:
      return null;
  }
}

/** Khung nền một giai đoạn trên canvas theo chuẩn Swimlane phân kênh Dribbble */
export const V2TraceStageGroup = React.memo(
  function V2TraceStageGroup({ data }: NodeProps<TraceStageFlowNode>) {
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
      <div className="relative h-full w-full pointer-events-none">
        {/* Tiêu đề giai đoạn và STT bên ngoài khung group ở góc trên bên trái */}
        <div className="pointer-events-auto absolute -top-7 left-1 right-1 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <V2Text
              as="span"
              className="font-mono text-xs font-bold text-muted-fg/80"
            >
              #{stage.stageNo}
            </V2Text>
            <V2Text
              as="span"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground"
            >
              {getStageIcon(stage.key)}
              {t(stage.shortTitleKey)}
            </V2Text>
            <V2Text
              as="span"
              className="font-mono text-[11px] font-medium text-muted-fg/70"
            >
              ({count})
            </V2Text>
          </div>

          {canAdd && (
            <V2Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 gap-1 px-2 text-[11px] text-muted-fg hover:text-foreground"
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

        {/* Khung swimlane bao bọc các thẻ chứng từ */}
        <div
          className={cn(
            "relative h-full w-full rounded-2xl border border-border/70 bg-gradient-to-b from-surface/40 via-surface/10 to-transparent shadow-2xs transition-colors",
            stage.accentBorder,
          )}
        >
          {count === 0 && (
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="flex flex-col items-center gap-1 text-center border border-dashed border-border/80 rounded-xl px-4 py-8 max-w-[240px]">
                <V2Text as="span" className="text-xs text-muted-fg/70">
                  {t("v2.traceability.canvas.stageEmpty")}
                </V2Text>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.data.count === next.data.count &&
    prev.data.allowEdit === next.data.allowEdit &&
    prev.data.stage === next.data.stage &&
    prev.data.allowedDocTypes === next.data.allowedDocTypes,
);
