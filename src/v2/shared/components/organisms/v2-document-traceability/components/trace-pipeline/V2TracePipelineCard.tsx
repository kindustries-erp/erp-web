import React from "react";
import { Edit3, ExternalLink, Lock, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceabilityNode } from "../../types/traceability.type";
import {
  canOpenTraceNode,
  canUnlinkTraceNode,
} from "../../utils/traceability.access";
import { copyText } from "../../utils/traceability.copy";
import {
  formatTraceAmount,
  formatTraceDate,
} from "../../utils/traceability.format";
import {
  getTraceabilityVisualMeta,
  isManualSettlementNode,
} from "../../utils/traceability.visual";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2TracePipelineCardProps {
  node: TraceabilityNode;
  allowEdit: boolean;
  onOpen: (node: TraceabilityNode) => void;
  onUnlink?: (node: TraceabilityNode) => void;
}

/** Thẻ gọn của một chứng từ trong chế độ quy trình (không có điểm nối) */
export function V2TracePipelineCard({
  node,
  allowEdit,
  onOpen,
  onUnlink,
}: V2TracePipelineCardProps) {
  const { t } = useV2Translation();
  const meta = getTraceabilityVisualMeta(node);
  const isManual = isManualSettlementNode(node);
  const canOpen = canOpenTraceNode(node, allowEdit) && !node.isCurrent;
  const canUnlink = canUnlinkTraceNode(node, allowEdit) && Boolean(onUnlink);

  const amount = Number(node.netOffAmount || node.amount || 0);
  const amountText = `${meta.amountPrefix ?? ""}${formatTraceAmount(amount)}`;

  return (
    <div
      className={cn(
        "group rounded-lg border bg-white p-3 transition-all dark:bg-slate-900",
        node.isCurrent
          ? "border-slate-500 shadow-xs ring-2 ring-slate-900 dark:ring-slate-100"
          : "border-slate-200/90 shadow-2xs hover:border-slate-400",
        node.restricted &&
          "border-dashed bg-slate-50 opacity-80 dark:bg-slate-900/50",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <V2Text
            as="span"
            className={cn(
              "flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider",
              meta.badgeCls,
            )}
            title={t(meta.fullTitleKey)}
          >
            {meta.label}
          </V2Text>
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto truncate px-1 font-mono text-xs font-bold text-slate-900 dark:text-slate-100"
            onClick={() => void copyText(node.docNo)}
            title={t("v2.traceability.node.copy")}
          >
            {node.docNo}
          </V2Button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {canUnlink && (
            <V2Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title={t("v2.traceability.node.unlink")}
              onClick={() => onUnlink?.(node)}
            >
              <Trash2 className="h-3 w-3" />
            </V2Button>
          )}
          {node.restricted ? (
            <Lock className="h-3 w-3 text-slate-400" />
          ) : (
            canOpen && (
              <V2Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-5 w-5 text-slate-400 hover:text-slate-900"
                title={
                  isManual
                    ? t("v2.traceability.node.editManual")
                    : t("v2.traceability.node.openDetail")
                }
                onClick={() => onOpen(node)}
              >
                {isManual ? (
                  <Edit3 className="h-3 w-3 text-primary" />
                ) : (
                  <ExternalLink className="h-3 w-3" />
                )}
              </V2Button>
            )
          )}
        </div>
      </div>

      <div className="mb-2 truncate text-[11px] text-slate-500">
        {node.restricted
          ? t("v2.traceability.node.restricted")
          : node.partnerName || node.title || "—"}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 font-mono text-[11px] dark:border-slate-800/80">
        <V2Text as="span" className="font-sans text-slate-400">
          {formatTraceDate(node.date)}
        </V2Text>
        {node.restricted ? (
          <V2Text as="span" className="text-slate-400">
            ***
          </V2Text>
        ) : (
          <V2Text
            as="span"
            className={
              meta.amountCls ??
              "font-semibold text-slate-800 dark:text-slate-200"
            }
            title={t(meta.fullTitleKey)}
          >
            {amountText}
          </V2Text>
        )}
      </div>
    </div>
  );
}
