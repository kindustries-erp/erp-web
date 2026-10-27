import React, { useEffect } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Traceability } from "../../hooks/useV2Traceability";
import {
  countLinkedNodes,
  getSelectableDocTypes,
} from "../../utils/traceability.helper";
import type { TraceabilityNodeType } from "../../types/traceability.type";
import { V2TraceabilityCanvas } from "../traceability-canvas";
import { V2TracePipeline } from "../trace-pipeline";
import { V2TraceTable } from "../trace-table";
import { V2TraceToolbar } from "../trace-toolbar";
import type { V2DocumentTraceabilityProps } from "./V2DocumentTraceability.type";

const CANVAS_HEIGHT = "h-[480px]";
/** Toàn màn hình: sơ đồ chiếm phần còn lại của modal (trừ thanh công cụ và tiêu đề) */
const FULLSCREEN_HEIGHT = "h-[calc(94vh-170px)]";

/** Sơ đồ chứng từ liên kết hoàn chỉnh: thanh công cụ, ba chế độ xem, và xác nhận gỡ liên kết */
export function V2DocumentTraceability(props: V2DocumentTraceabilityProps) {
  const { t } = useV2Translation();
  const {
    rootId,
    fetchGraph,
    graphData,
    editMode = false,
    allowedDocTypes,
    onLinkedCountChange,
    onAddLink,
    onUnlinkNode,
    onOpenDocument,
    onEditManualSettlement,
  } = props;
  const trace = useV2Traceability({
    rootId,
    fetchGraph,
    graphData,
    editMode,
    onUnlinkNode,
  });
  const {
    graph,
    viewMode,
    direction,
    isFullscreen,
    linkSelectorOpen,
    unlinkingNode,
    unlinkingLoading,
  } = trace;

  const allowEdit = Boolean(editMode);
  const linkTypes: TraceabilityNodeType[] =
    getSelectableDocTypes(allowedDocTypes);
  const canLink = Boolean(allowEdit && onAddLink && linkTypes.length > 0);
  const linkedCount = graph ? countLinkedNodes(graph) : 0;

  useEffect(() => {
    onLinkedCountChange?.(linkedCount);
  }, [linkedCount, onLinkedCountChange]);

  const selectLinkType = (type: TraceabilityNodeType) => {
    trace.setLinkSelectorOpen(false);
    onAddLink?.(undefined, type);
  };

  const content = (
    <div className="flex flex-col gap-3">
      <V2TraceToolbar
        linkedCount={linkedCount}
        canLink={canLink}
        linkTypes={linkTypes}
        linkOpen={linkSelectorOpen}
        onLinkOpenChange={trace.setLinkSelectorOpen}
        onSelectLinkType={selectLinkType}
        viewMode={viewMode}
        onViewModeChange={trace.setViewMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={trace.toggleFullscreen}
      />

      {trace.error && (
        <V2AlertBanner>{t("v2.traceability.state.error")}</V2AlertBanner>
      )}

      {trace.loading || !graph ? (
        <V2Skeleton
          className={cn(
            "w-full rounded-xl",
            isFullscreen ? FULLSCREEN_HEIGHT : CANVAS_HEIGHT,
          )}
        />
      ) : viewMode === "canvas" ? (
        <div
          className={cn(
            "w-full overflow-hidden rounded-xl border border-border bg-surface  ",
            isFullscreen ? FULLSCREEN_HEIGHT : CANVAS_HEIGHT,
          )}
        >
          <V2TraceabilityCanvas
            graph={graph}
            direction={direction}
            allowEdit={allowEdit}
            allowedDocTypes={allowedDocTypes}
            isFullscreen={isFullscreen}
            onToggleDirection={trace.toggleDirection}
            onAddLink={canLink ? onAddLink : undefined}
            onUnlinkNode={trace.requestUnlink}
            onOpenDocument={onOpenDocument}
            onEditManualSettlement={onEditManualSettlement}
          />
        </div>
      ) : viewMode === "pipeline" ? (
        <V2TracePipeline
          graph={graph}
          allowEdit={allowEdit}
          allowedDocTypes={allowedDocTypes}
          onAddLink={canLink ? onAddLink : undefined}
          onUnlinkNode={trace.requestUnlink}
          onOpenDocument={onOpenDocument}
          onEditManualSettlement={onEditManualSettlement}
        />
      ) : (
        <V2TraceTable
          graph={graph}
          allowEdit={allowEdit}
          onOpenDocument={onOpenDocument}
          onEditManualSettlement={onEditManualSettlement}
          onUnlinkNode={trace.requestUnlink}
        />
      )}

      <V2ConfirmModal
        open={Boolean(unlinkingNode)}
        onOpenChange={(open) => !open && trace.cancelUnlink()}
        variant="danger"
        title={t("v2.traceability.unlink.title")}
        message={t("v2.traceability.unlink.message", {
          docNo: unlinkingNode?.docNo ?? "",
        })}
        confirmLabel={t("v2.traceability.unlink.confirm")}
        cancelLabel={t("v2.common.cancel")}
        isLoading={unlinkingLoading}
        onConfirm={trace.confirmUnlink}
        onCancel={trace.cancelUnlink}
      />
    </div>
  );

  // Toàn màn hình dùng Radix Dialog lồng trong drawer (không fixed/portal ra body: bị drawer chặn)
  if (isFullscreen) {
    return (
      <V2Modal
        open
        size="screen"
        hideCloseButton
        onOpenChange={(open) => !open && trace.exitFullscreen()}
      >
        {content}
      </V2Modal>
    );
  }
  return content;
}
