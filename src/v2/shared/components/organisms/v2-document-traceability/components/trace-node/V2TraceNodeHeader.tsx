import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Lock,
  Trash2,
} from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { cn } from "@/v2/shared/utils/cn";
import type { TraceabilityVisualMeta } from "../../utils/traceability.visual";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { getDocTypeIcon } from "./traceNode.helper";

export interface V2TraceNodeHeaderProps {
  meta: TraceabilityVisualMeta;
  docNo: string;
  copied: boolean;
  isCurrent: boolean;
  restricted: boolean;
  requiredResource: string;
  canUnlink: boolean;
  canOpen: boolean;
  isManual: boolean;
  statusLabel?: string;
  onCopy: (event: React.MouseEvent) => void;
  onUnlink: (event: React.MouseEvent) => void;
  onOpen: (event: React.MouseEvent) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

/** Hàng đầu thẻ: nhãn loại, trạng thái thuế, số chứng từ, và các nút thao tác */
export function V2TraceNodeHeader(props: V2TraceNodeHeaderProps) {
  const {
    meta,
    docNo,
    copied,
    isCurrent,
    restricted,
    canUnlink,
    canOpen,
    isManual,
    statusLabel,
    t,
  } = props;
  const stopDrag = (e: React.SyntheticEvent) => e.stopPropagation();
  const actionClass = "h-6 w-6 nodrag nopan transition-colors";

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 ">
      <div className="flex min-w-0 items-center gap-1.5">
        <V2Text
          as="span"
          className={cn(
            "flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider",
            meta.badgeCls,
          )}
          title={t(meta.fullTitleKey)}
        >
          {getDocTypeIcon(meta.docType)}
          {meta.isInvoiceIn && (
            <ArrowDownLeft className="h-2.5 w-2.5 opacity-80" />
          )}
          {meta.isInvoiceOut && (
            <ArrowUpRight className="h-2.5 w-2.5 opacity-80" />
          )}
          {meta.label}
        </V2Text>
        {statusLabel && (
          <V2Text
            as="span"
            className={cn(
              "rounded border px-1 py-0.5 font-mono text-[9px] font-bold tracking-tight",
              meta.statusBadgeCls,
            )}
          >
            {statusLabel}
          </V2Text>
        )}
        <V2Text
          as="span"
          className="truncate font-mono text-xs font-bold text-foreground "
        >
          {docNo}
        </V2Text>
        {docNo !== "***" && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={props.onCopy}
            onPointerDown={stopDrag}
            onMouseDown={stopDrag}
            className="nodrag nopan h-5 w-5 text-muted-fg transition-colors hover:text-muted-fg "
            title={
              copied
                ? t("v2.traceability.node.copied")
                : t("v2.traceability.node.copy")
            }
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </V2Button>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        {isCurrent && (
          <V2Text
            as="span"
            className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-foreground  "
          >
            {t("v2.traceability.node.current")}
          </V2Text>
        )}
        {canUnlink && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              actionClass,
              "text-muted-fg hover:bg-destructive/10 hover:text-destructive ",
            )}
            title={t("v2.traceability.node.unlink")}
            onClick={props.onUnlink}
            onPointerDown={stopDrag}
            onMouseDown={stopDrag}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </V2Button>
        )}
        {restricted ? (
          <div
            className="cursor-not-allowed rounded p-1 text-muted-fg"
            title={`${t("v2.traceability.node.noPermission")} (${props.requiredResource})`}
          >
            <Lock className="h-3.5 w-3.5" />
          </div>
        ) : (
          canOpen &&
          !isCurrent && (
            <V2Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                actionClass,
                "text-muted-fg hover:bg-muted hover:text-foreground ",
              )}
              title={
                isManual
                  ? t("v2.traceability.node.editManual")
                  : t("v2.traceability.node.openDetail")
              }
              onClick={props.onOpen}
              onPointerDown={stopDrag}
              onMouseDown={stopDrag}
            >
              {isManual ? (
                <Edit3 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
            </V2Button>
          )
        )}
      </div>
    </div>
  );
}
