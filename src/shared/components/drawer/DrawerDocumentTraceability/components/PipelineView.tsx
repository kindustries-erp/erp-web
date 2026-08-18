import React from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/shared/types/traceability";
import {
  STAGES_CONFIG,
  getStageForDocType,
  openGlobalErpDocument,
} from "../constants";
import type { BusinessStageKey } from "../types";
import { isManualSettlementNode } from "./DocNode";

interface TraceabilityPipelineViewProps {
  graphData: TraceabilityGraphData;
  allowEdit?: boolean;
  onAddLink?: (
    stageKey: BusinessStageKey,
    docType?: TraceabilityNodeType,
  ) => void;
  onUnlinkNode?: (node: TraceabilityNode) => void;
  allowedDocTypes?: TraceabilityNodeType[];
  onEditManualSettlement?: (node: TraceabilityNode) => void;
}

export function TraceabilityPipelineView({
  graphData,
  allowEdit,
  onAddLink,
  onUnlinkNode,
  allowedDocTypes,
  onEditManualSettlement,
}: TraceabilityPipelineViewProps) {
  const t = useT();

  const stageGroupsMap = new Map<BusinessStageKey, TraceabilityNode[]>();
  STAGES_CONFIG.forEach((s) => stageGroupsMap.set(s.key, []));

  graphData.nodes.forEach((n) => {
    const stage = getStageForDocType(n.docType);
    stageGroupsMap.get(stage.key)!.push(n);
  });

  const handleOpenDoc = (n: TraceabilityNode) => {
    if (n.restricted || n.hasPermission === false) return;
    if (n.docType === "JOURNAL_ENTRY") return;

    if (isManualSettlementNode(n)) {
      if (!allowEdit) return;

      if (onEditManualSettlement) {
        onEditManualSettlement(n);
      } else {
        window.dispatchEvent(
          new CustomEvent("open_manual_settlement_editor", {
            detail: { node: n },
          }),
        );
      }
      return;
    }

    openGlobalErpDocument(n.docType, n.id);
  };

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-4 pt-1">
      {STAGES_CONFIG.map((stage, sIdx) => {
        const stageNodes = stageGroupsMap.get(stage.key) || [];
        const validStageTypes = !allowedDocTypes
          ? stage.types
          : stage.types.filter((typ) => allowedDocTypes.includes(typ));
        const canAdd = Boolean(
          allowEdit && onAddLink && validStageTypes.length > 0,
        );

        return (
          <React.Fragment key={stage.key}>
            <div className="w-[300px] flex-shrink-0 flex flex-col gap-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider border",
                      stage.badgeCls,
                    )}
                  >
                    {stage.shortTitle}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    ({stageNodes.length})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {canAdd && (
                    <button
                      type="button"
                      onClick={() =>
                        onAddLink?.(
                          stage.key,
                          validStageTypes.length === 1
                            ? validStageTypes[0]
                            : undefined,
                        )
                      }
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                      title={`${t("Ghép nối chứng từ vào")} ${stage.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {stageNodes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-lg border-slate-200 bg-white/40">
                  {t("Không có chứng từ")}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stageNodes.map((n) => {
                    const isJournal = n.docType === "JOURNAL_ENTRY";
                    const isManual = isManualSettlementNode(n);

                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "p-3 rounded-lg border bg-white dark:bg-slate-900 transition-all group",
                          n.isCurrent
                            ? "ring-2 ring-slate-900 dark:ring-slate-100 border-slate-500 shadow-xs"
                            : "border-slate-200/90 shadow-2xs hover:border-slate-400",
                          n.restricted &&
                            "border-dashed bg-slate-50 opacity-80",
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {n.docNo}
                          </span>
                          <div className="flex items-center gap-1">
                            {allowEdit &&
                              !n.isCurrent &&
                              !n.restricted &&
                              n.depth === 1 &&
                              onUnlinkNode && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-5 w-5 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => onUnlinkNode(n)}
                                  title={t("Gỡ liên kết")}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}

                            {!n.restricted &&
                            n.hasPermission &&
                            !n.isCurrent &&
                            !isJournal &&
                            (!isManual || allowEdit) ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="h-5 w-5 text-slate-400 hover:text-slate-900"
                                onClick={() => handleOpenDoc(n)}
                                title={
                                  isManual
                                    ? t("Chỉnh sửa thu / chi ngoài")
                                    : t("Xem chi tiết")
                                }
                              >
                                {isManual ? (
                                  <Edit3 className="w-3 h-3 text-primary" />
                                ) : (
                                  <ExternalLink className="w-3 h-3" />
                                )}
                              </Button>
                            ) : n.restricted ? (
                              <Lock className="w-3 h-3 text-slate-400" />
                            ) : null}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 truncate mb-2">
                          {n.restricted
                            ? t("Chứng từ bảo mật")
                            : n.partnerName || n.title || "—"}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 font-mono">
                          <span className="text-slate-400 font-sans">
                            {n.date ? formatGMT7(n.date, "date") : "—"}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {n.restricted
                              ? "***"
                              : n.netOffAmount
                                ? money(n.netOffAmount)
                                : money(n.amount || 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {sIdx < STAGES_CONFIG.length - 1 && (
              <div className="pt-8 flex-shrink-0 text-slate-300 dark:text-slate-700">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
