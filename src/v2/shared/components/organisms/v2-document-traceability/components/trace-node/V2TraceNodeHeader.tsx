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
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800/80">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider",
            meta.badgeCls,
          )}
          title={t(meta.fullTitleKey)}
        >
          {meta.isInvoiceIn && (
            <ArrowDownLeft className="h-2.5 w-2.5 opacity-80" />
          )}
          {meta.isInvoiceOut && (
            <ArrowUpRight className="h-2.5 w-2.5 opacity-80" />
          )}
          {meta.label}
        </span>
        {statusLabel && (
          <span
            className={cn(
              "rounded border px-1 py-0.5 font-mono text-[9px] font-bold tracking-tight",
              meta.statusBadgeCls,
            )}
          >
            {statusLabel}
          </span>
        )}
        <span className="truncate font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
          {docNo}
        </span>
        {docNo !== "***" && (
          <button
            type="button"
            onClick={props.onCopy}
            onPointerDown={stopDrag}
            onMouseDown={stopDrag}
            className="nodrag nopan rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            title={
              copied
                ? t("v2.traceability.node.copied")
                : t("v2.traceability.node.copy")
            }
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        {isCurrent && (
          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            {t("v2.traceability.node.current")}
          </span>
        )}
        {canUnlink && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              actionClass,
              "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40",
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
            className="cursor-not-allowed rounded p-1 text-slate-400"
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
                "text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
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
