import React, { useEffect, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Lock } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceDocFlowNode } from "../../types/traceability.flow.type";
import {
  getTraceabilityVisualMeta,
  isManualSettlementNode,
} from "../../utils/traceability.visual";
import { copyText } from "../../utils/traceability.copy";
import {
  formatTraceAmount,
  formatTraceDate,
} from "../../utils/traceability.format";
import { V2TraceNodeHandles } from "./V2TraceNodeHandles";
import { V2TraceNodeHeader } from "./V2TraceNodeHeader";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { getPartnerIcon } from "./traceNode.helper";

const COPIED_MS = 1500;

/** Thẻ một chứng từ: nhãn loại, số chứng từ, đối tác, ngày và số tiền */
export const V2TraceNode = React.memo(
  function V2TraceNode({
    data,
    selected,
    dragging,
  }: NodeProps<TraceDocFlowNode>) {
    const { t } = useV2Translation();
    const { node, allowEdit, actions } = data;
    const meta = getTraceabilityVisualMeta(node);
    const isJournal = node.docType === "JOURNAL_ENTRY";
    const isManual = isManualSettlementNode(node);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (!copied) return;
      const timer = setTimeout(() => setCopied(false), COPIED_MS);
      return () => clearTimeout(timer);
    }, [copied]);

    const canOpen =
      !node.restricted &&
      node.hasPermission !== false &&
      !isJournal &&
      (!isManual || allowEdit);
    const canUnlink =
      allowEdit &&
      !node.isCurrent &&
      !node.restricted &&
      node.depth === 1 &&
      Boolean(actions.onUnlinkNode);

    const handleOpen = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!canOpen) return;
      if (isManual) actions.onEditManualSettlement?.(node);
      else actions.onOpenDocument?.(node);
    };

    const handleCopy = async (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (await copyText(node.docNo)) setCopied(true);
    };

    const handleUnlink = (event: React.MouseEvent) => {
      event.stopPropagation();
      actions.onUnlinkNode?.(node);
    };

    const amount = Number(node.netOffAmount || node.amount || 0);
    const amountText = `${meta.amountPrefix ?? ""}${formatTraceAmount(amount)}`;
    const amountCls =
      meta.amountCls ??
      (node.netOffAmount
        ? "text-success font-semibold"
        : "text-foreground font-semibold");

    const partner = node.partnerName || node.title || "—";
    const subtitle =
      meta.isInvoiceIn && node.partnerName
        ? `${t("v2.traceability.node.supplierPrefix")} ${partner}`
        : meta.isInvoiceOut && node.partnerName
          ? `${t("v2.traceability.node.customerPrefix")} ${partner}`
          : partner;

    const isActive = Boolean(node.isCurrent || selected);

    return (
      <div
        onDoubleClick={handleOpen}
        className={cn(
          "group relative z-10 w-[300px] cursor-pointer overflow-hidden rounded-2xl bg-surface text-left",
          isActive
            ? "border-2 border-primary border-l-4 border-l-primary shadow-md"
            : (meta.cardBorderCls ??
                "border border-border border-l-4 border-l-muted-fg/40 hover:border-border"),
          dragging
            ? "!transition-none shadow-none"
            : "transition-all duration-200 ease-out will-change-transform shadow-2xs hover:-translate-y-0.5 hover:shadow-md",
          node.restricted &&
            "cursor-default border-dashed border-border bg-muted opacity-80",
        )}
      >
        <V2TraceNodeHandles />
        <V2TraceNodeHeader
          meta={meta}
          docNo={node.docNo}
          copied={copied}
          isCurrent={Boolean(node.isCurrent)}
          restricted={Boolean(node.restricted)}
          requiredResource={node.requiredResource}
          canUnlink={canUnlink}
          canOpen={canOpen}
          isManual={isManual}
          statusLabel={meta.statusLabelKey ? t(meta.statusLabelKey) : undefined}
          onCopy={handleCopy}
          onUnlink={handleUnlink}
          onOpen={handleOpen}
          t={t}
        />

        <div className="space-y-2 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-fg">
            {!node.restricted &&
              getPartnerIcon(meta.isInvoiceIn, meta.isInvoiceOut)}
            <V2Text as="span" className="line-clamp-1 truncate">
              {node.restricted ? (
                <V2Text
                  as="span"
                  className="flex items-center gap-1 italic text-muted-fg"
                >
                  <Lock className="h-3 w-3" />{" "}
                  {t("v2.traceability.node.restricted")}
                </V2Text>
              ) : (
                subtitle
              )}
            </V2Text>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-2 font-mono text-xs">
            <V2Text as="span" className="font-sans text-[11px] text-muted-fg">
              {formatTraceDate(node.date)}
            </V2Text>
            {node.restricted ? (
              <V2Text as="span" className="font-normal text-muted-fg">
                ***
              </V2Text>
            ) : (
              <V2Text
                as="span"
                className={amountCls}
                title={t(meta.fullTitleKey)}
              >
                {amountText}
              </V2Text>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.selected === next.selected &&
    prev.dragging === next.dragging &&
    prev.data.node === next.data.node &&
    prev.data.allowEdit === next.data.allowEdit,
);
