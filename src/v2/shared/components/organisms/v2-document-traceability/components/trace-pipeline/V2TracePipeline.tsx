import React, { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { TRACEABILITY_STAGES } from "../../constants/traceability.constants";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
  TraceabilityStageConfig,
} from "../../types/traceability.type";
import type { TraceabilityCanvasActions } from "../../types/traceability.flow.type";
import { getStageForDocType } from "../../utils/traceability.helper";
import { V2TracePipelineCard } from "./V2TracePipelineCard";

export interface V2TracePipelineProps extends TraceabilityCanvasActions {
  graph: TraceabilityGraphData;
  allowEdit: boolean;
  allowedDocTypes?: TraceabilityNodeType[];
}

/** Chế độ quy trình: bốn giai đoạn xếp ngang, chứng từ trong mỗi giai đoạn xếp dọc */
export function V2TracePipeline({
  graph,
  allowEdit,
  allowedDocTypes,
  onAddLink,
  onUnlinkNode,
  onOpenDocument,
  onEditManualSettlement,
}: V2TracePipelineProps) {
  const { t } = useV2Translation();
  const byStage = useMemo(() => {
    const groups = new Map<string, TraceabilityNode[]>(
      TRACEABILITY_STAGES.map((s) => [s.key, []]),
    );
    for (const node of graph.nodes)
      groups.get(getStageForDocType(node.docType).key)?.push(node);
    return groups;
  }, [graph.nodes]);

  const openNode = (node: TraceabilityNode) => {
    if (node.docType === "BANK_TXN" && node.id.startsWith("manual-"))
      onEditManualSettlement?.(node);
    else onOpenDocument?.(node);
  };

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-3 pt-1">
      {TRACEABILITY_STAGES.map((stage, index) => {
        const docs = byStage.get(stage.key) ?? [];
        // Giống V1: giai đoạn chỉ nhận các loại nằm trong allowedDocTypes (nếu có)
        const addable = allowedDocTypes
          ? stage.types.filter((type) => allowedDocTypes.includes(type))
          : stage.types;
        return (
          <React.Fragment key={stage.key}>
            <StageColumn
              stage={stage}
              count={docs.length}
              canAdd={Boolean(allowEdit && onAddLink && addable.length > 0)}
              onAdd={() =>
                onAddLink?.(
                  stage.key,
                  addable.length === 1 ? addable[0] : undefined,
                )
              }
              addLabel={t("v2.traceability.stage.addLinkTo", {
                stage: t(stage.titleKey),
              })}
              emptyLabel={t("v2.traceability.pipeline.empty")}
            >
              {docs.map((node) => (
                <V2TracePipelineCard
                  key={node.id}
                  node={node}
                  allowEdit={allowEdit}
                  onOpen={openNode}
                  onUnlink={onUnlinkNode}
                />
              ))}
            </StageColumn>
            {index < TRACEABILITY_STAGES.length - 1 && (
              <div className="flex-shrink-0 pt-8 text-slate-300 dark:text-slate-700">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StageColumnProps {
  stage: TraceabilityStageConfig;
  count: number;
  canAdd: boolean;
  onAdd: () => void;
  addLabel: string;
  emptyLabel: string;
  children: React.ReactNode;
}

function StageColumn({
  stage,
  count,
  canAdd,
  onAdd,
  addLabel,
  emptyLabel,
  children,
}: StageColumnProps) {
  const { t } = useV2Translation();
  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col gap-2 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
              stage.badgeCls,
            )}
          >
            {t(stage.shortTitleKey)}
          </span>
          <span className="font-mono text-xs font-medium text-slate-500">
            ({count})
          </span>
        </div>
        {canAdd && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5 text-slate-400 hover:text-slate-700"
            title={addLabel}
            aria-label={addLabel}
            onClick={onAdd}
          >
            <Plus className="h-3.5 w-3.5" />
          </V2Button>
        )}
      </div>
      {count === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white/40 py-8 text-center text-xs text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2.5">{children}</div>
      )}
    </div>
  );
}
