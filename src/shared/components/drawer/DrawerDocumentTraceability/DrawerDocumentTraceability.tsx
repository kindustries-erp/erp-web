import React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  Network,
  GitCommit,
  Table as TableIcon,
  Loader2,
  ShieldAlert,
  Plus,
  ChevronDown,
  Link2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Popover } from "@/core/components/ui/Popover";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { money } from "@/shared/utils/format";
import type { DrawerDocumentTraceabilityProps } from "./types";
import { useTraceabilityLogic } from "./useTraceabilityLogic";
import { LinkSelectorPopoverContent } from "./components/LinkSelectorPopover";
import { CanvasView } from "./components/CanvasView";
import { TraceabilityPipelineView } from "./components/PipelineView";
import { TraceabilityTableView } from "./components/TableView";

export function DrawerDocumentTraceability(
  props: DrawerDocumentTraceabilityProps,
) {
  const {
    rootType,
    onAddLink,
    allowedDocTypes,
    onEditManualSettlement,
    className,
  } = props;
  const t = useT();

  const {
    viewMode,
    setViewMode,
    canvasDirection,
    toggleLayoutDirection,
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    graphData,
    loading,
    error,
    loadData,
    linkSelectorOpen,
    setLinkSelectorOpen,
    unlinkingNode,
    setUnlinkingNode,
    unlinkingLoading,
    effectiveAllowEdit,
    selectableDocTypes,
    handleRequestUnlink,
    handleConfirmUnlink,
  } = useTraceabilityLogic(props);

  const renderContent = (fullscreen: boolean) => (
    <div
      className={cn(
        "w-full flex flex-col transition-all",
        fullscreen
          ? "fixed inset-0 z-[420] bg-white dark:bg-slate-950 shadow-2xl overflow-hidden animate-in fade-in duration-200"
          : "min-h-[480px]",
      )}
    >
      {/* Top Header Bar: Statistics & View Switcher with proper generous padding */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="text-slate-600 dark:text-slate-400">
            {t("Tổng chứng từ:")}{" "}
            <strong className="font-mono text-slate-900 dark:text-slate-100">
              {graphData ? graphData.nodes.length - 1 : 0}
            </strong>
          </span>

          {graphData && graphData.summary?.totalNetOffAmount > 0 && (
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>{t("Đã cấn trừ:")}</span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                {money(graphData.summary.totalNetOffAmount)}
              </strong>
              <span className="text-[10px] text-slate-400 font-mono">
                ({graphData.summary.matchRatio}%)
              </span>
            </span>
          )}
        </div>

        {/* Action Controls & View Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {effectiveAllowEdit &&
            onAddLink &&
            (selectableDocTypes.length === 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddLink?.(undefined, selectableDocTypes[0])}
                className="h-8 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium cursor-pointer"
                title={t("Ghép nối chứng từ có sẵn")}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{t("Ghép nối chứng từ")}</span>
              </Button>
            ) : (
              <Popover
                open={linkSelectorOpen}
                onOpenChange={setLinkSelectorOpen}
                side="bottom"
                align="end"
                content={
                  <LinkSelectorPopoverContent
                    selectableDocTypes={selectableDocTypes}
                    onSelect={(type) => {
                      setLinkSelectorOpen(false);
                      onAddLink?.(undefined, type);
                    }}
                  />
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 font-medium cursor-pointer"
                  title={t("Ghép nối chứng từ có sẵn")}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{t("Ghép nối chứng từ")}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </Button>
              </Popover>
            ))}

          {/* View Mode Tabs + Global Fullscreen Utility */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "canvas"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t("Canvas")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "pipeline"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{t("Quy trình")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t("Bảng kê")}</span>
            </button>

            {/* Global Fullscreen Toggle Button on Tab Bar */}
            <div className="flex items-center pl-1 border-l border-slate-200 dark:border-slate-700 ml-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                onClick={toggleFullscreen}
                title={
                  fullscreen
                    ? t("Thu nhỏ Canvas (Esc)")
                    : t("Toàn màn hình Canvas")
                }
              >
                {fullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      {loading ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 text-slate-400 p-8",
            fullscreen ? "flex-1 min-h-[400px]" : "h-[450px]",
          )}
        >
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          <span className="text-xs">{t("Đang tải mạng lưới chứng từ...")}</span>
        </div>
      ) : error ? (
        <div className="m-4 h-[200px] flex flex-col items-center justify-center gap-2 text-rose-500 bg-rose-50/50 rounded-xl border border-rose-200 p-4 text-center">
          <ShieldAlert className="w-6 h-6" />
          <span className="text-xs font-medium">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="mt-2 text-xs"
          >
            {t("Thử lại")}
          </Button>
        </div>
      ) : !graphData || graphData.nodes.length <= 1 ? (
        <div className="m-4 h-[260px] flex flex-col items-center justify-center gap-3 text-slate-400 border border-dashed rounded-xl bg-slate-50/40 p-6 text-center">
          <Network className="w-7 h-7 opacity-40" />
          <span className="text-xs max-w-md text-slate-600 dark:text-slate-400 leading-relaxed">
            {rootType === "INVOICE"
              ? t(
                  "Chưa có chứng từ ghép nối. Hóa đơn là nguồn đối soát chính và có thể ghép nối với sao kê ngân hàng, đơn mua/bán hàng hoặc phiếu dịch vụ.",
                )
              : t("Chưa có chứng từ liên kết trực tiếp hay gián tiếp nào.")}
          </span>
          {effectiveAllowEdit &&
            onAddLink &&
            (selectableDocTypes.length === 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddLink?.(undefined, selectableDocTypes[0])}
                className="gap-1.5 text-xs text-primary border-primary/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Ghép nối chứng từ đầu tiên")}</span>
              </Button>
            ) : (
              <Popover
                open={linkSelectorOpen}
                onOpenChange={setLinkSelectorOpen}
                side="bottom"
                align="center"
                content={
                  <LinkSelectorPopoverContent
                    selectableDocTypes={selectableDocTypes}
                    onSelect={(type) => {
                      setLinkSelectorOpen(false);
                      onAddLink?.(undefined, type);
                    }}
                  />
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-primary border-primary/30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("Ghép nối chứng từ đầu tiên")}</span>
                </Button>
              </Popover>
            ))}
        </div>
      ) : (
        <div
          className={cn(
            "w-full transition-all flex-1",
            fullscreen && "flex flex-col min-h-0",
          )}
        >
          {viewMode === "canvas" && (
            <div
              className={cn(
                "w-full bg-slate-50/30 dark:bg-slate-950 relative transition-all overflow-hidden",
                fullscreen
                  ? "flex-1 h-[calc(100vh-65px)] min-h-[500px]"
                  : "h-[500px]",
              )}
            >
              <CanvasView
                graphData={graphData}
                direction={canvasDirection}
                isFullscreen={fullscreen}
                allowEdit={effectiveAllowEdit}
                onAddLink={onAddLink}
                onUnlinkNode={handleRequestUnlink}
                allowedDocTypes={allowedDocTypes}
                onToggleDirection={toggleLayoutDirection}
                onEditManualSettlement={onEditManualSettlement}
              />
            </div>
          )}

          {viewMode === "pipeline" && (
            <div className="p-4">
              <TraceabilityPipelineView
                graphData={graphData}
                allowEdit={effectiveAllowEdit}
                onAddLink={onAddLink}
                onUnlinkNode={handleRequestUnlink}
                allowedDocTypes={allowedDocTypes}
                onEditManualSettlement={onEditManualSettlement}
              />
            </div>
          )}

          {viewMode === "table" && (
            <div className="p-4">
              <TraceabilityTableView
                graphData={graphData}
                allowEdit={effectiveAllowEdit}
                onUnlinkNode={handleRequestUnlink}
                onEditManualSettlement={onEditManualSettlement}
              />
            </div>
          )}
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      <ConfirmModal
        open={!!unlinkingNode}
        title={t("Gỡ liên kết chứng từ")}
        message={
          unlinkingNode
            ? `${t("Bạn có chắc chắn muốn gỡ liên kết chứng từ")} "${unlinkingNode.docNo}" (${unlinkingNode.partnerName || unlinkingNode.title || ""}) ${t("khỏi chuỗi chứng từ này không?")}`
            : ""
        }
        confirmLabel={t("Gỡ liên kết")}
        danger
        loading={unlinkingLoading}
        onConfirm={handleConfirmUnlink}
        onCancel={() => setUnlinkingNode(null)}
      />
    </div>
  );

  return (
    <>
      <div className={cn("w-full flex flex-col", className)}>
        {isFullscreen ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 text-center m-3">
            <Network className="w-8 h-8 text-primary animate-pulse" />
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t("Canvas đang được mở ở chế độ Toàn màn hình.")}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{t("Thu nhỏ lại (Esc)")}</span>
            </Button>
          </div>
        ) : (
          renderContent(false)
        )}
      </div>

      {isFullscreen &&
        typeof document !== "undefined" &&
        createPortal(renderContent(true), document.body)}
    </>
  );
}
