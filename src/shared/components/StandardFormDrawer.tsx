import { useState, useEffect } from "react";
import { DrawerModal, DrawerSection, type DrawerAction } from "./DrawerModal";
import { useT } from "@/core/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import type { DrawerMode } from "../stores/useDrawerStore";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";
import {
  DrawerRelatedDeck,
  type DrawerRelatedTabItem,
} from "./drawer/DrawerRelatedDeck";

export type { DrawerRelatedTabItem };
export * from "./drawer";

// ── Size presets ──────────────────────────────────────────────────────────────
// All sizes scale fluidly via `vw` on desktop while bounded by explicit min/max widths
// and hard bounded by max-width: calc(100vw - 208px) on desktop so drawer never covers sidebar.
const SIZE_CLASS: Record<string, string> = {
  sm: "w-full md:w-[90vw] lg:w-[35vw] xl:w-[32vw] 2xl:w-[28vw] min-w-[380px] max-w-[560px]",
  md: "w-full md:w-[92vw] lg:w-[52vw] xl:w-[46vw] 2xl:w-[40vw] min-w-[560px] max-w-[820px]",
  lg: "w-full md:w-[95vw] lg:w-[70vw] xl:w-[65vw] 2xl:w-[58vw] min-w-[780px] max-w-[1150px]",
  xl: "w-full md:w-[95vw] lg:w-[86vw] xl:w-[80vw] 2xl:w-[75vw] min-w-[960px] max-w-[1550px]",
  full: "w-full md:w-[95vw] lg:w-[calc(100vw-208px)] xl:w-[calc(100vw-208px)] max-w-[calc(100vw-208px)]",
};

export interface StandardFormDrawerProps {
  open: boolean;
  mode: DrawerMode;
  onClose: () => void;
  onToggleEdit?: () => void;

  /** Optional icon rendered in the drawer header */
  icon?: React.ReactNode;

  title: string;
  titleExtra?: React.ReactNode;
  subtitle?: React.ReactNode;

  actions?: DrawerAction[];

  loading?: boolean;
  error?: string | null;

  zIndex?: number;

  /** Layout variant — defaults to "2-columns" */
  layout?: "1-column" | "2-columns";

  /**
   * Panel width preset. Ignored when `panelClassName` overrides width explicitly.
   * - sm  : ~500px  — 1-column simple forms (profile, tags)
   * - md  : ~700px  — medium-complexity forms
   * - lg  : ~1000px — default 2-column
   * - xl  : ~1200–1400px — wide 2-column (PO, Sales, Production)
   * - full: max available within sidebar constraint
   * Defaults to "sm" for 1-column, "xl" for 2-columns.
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * When true, show a confirm dialog before closing (passed through to DrawerModal).
   * Useful for edit-mode forms that may have unsaved changes.
   */
  confirmOnClose?: boolean;

  leftPanel: React.ReactNode;
  rightPanel?: React.ReactNode;

  /** Allows overriding the default wide panel width class */
  panelClassName?: string;

  /** Hide right panel completely if not needed */
  hideRightPanel?: boolean;

  /** Title for the standard right panel. If provided, the right panel will be wrapped in a collapsible DrawerSection */
  rightPanelTitle?: React.ReactNode;

  /** Default collapsed state for the right panel */
  rightPanelDefaultCollapsed?: boolean;

  /** Whether the right panel should be sticky and have its own scrollbar. Default: true */
  stickyRightPanel?: boolean;

  /** Whether the right panel should be collapsible. Defaults to true if rightPanelTitle is provided. */
  collapsibleRightPanel?: boolean;
  noAnimation?: boolean;
  asContent?: boolean;

  /** Custom element to render on the left side of the footer */
  footerLeft?: React.ReactNode;

  /** Optional class for drawer body container */
  bodyClassName?: string;

  /**
   * Danh sách các tab thông tin liên quan (Lịch sử, Chứng từ liên quan, Đính kèm, Ghi chú...)
   * Hiển thị bên dưới Horizon Divider Bar ở đáy Main Body.
   */
  relatedTabs?: DrawerRelatedTabItem[];

  /** Tab mặc định được kích hoạt trong relatedTabs */
  defaultRelatedTabKey?: string;

  /** Trạng thái thu gọn mặc định của vùng thông tin liên quan (mặc định: false - mở) */
  defaultRelatedCollapsed?: boolean;

  /** Custom hoàn toàn nội dung bên dưới Horizon Divider Bar nếu không dùng relatedTabs */
  bottomPanel?: React.ReactNode;

  /** Tiêu đề thanh phân cách nếu dùng custom bottomPanel */
  bottomPanelTitle?: React.ReactNode;

  /** Callback khi người dùng chuyển đổi tab liên quan */
  onRelatedTabChange?: (tabKey: string) => void;

  /** Bật ô tìm kiếm nhanh trên thanh Horizon Divider */
  enableRelatedSearch?: boolean;

  /** Callback khi thay đổi từ khóa tìm kiếm */
  onRelatedSearchChange?: (query: string) => void;

  /** ClassName bổ sung cho card container của Related Deck */
  deckCardClassName?: string;
}

export function StandardFormDrawer({
  open,
  mode,
  onClose,
  onToggleEdit,
  icon,
  title,
  titleExtra,
  subtitle,
  actions,
  loading,
  error,
  layout = "2-columns",
  size,
  confirmOnClose,
  leftPanel,
  rightPanel,
  panelClassName,
  bodyClassName,
  hideRightPanel = false,
  rightPanelTitle,
  rightPanelDefaultCollapsed = false,
  stickyRightPanel = false,
  collapsibleRightPanel = false,
  zIndex,
  asContent = false,
  noAnimation = false,
  footerLeft,
  relatedTabs,
  defaultRelatedTabKey,
  defaultRelatedCollapsed = false,
  bottomPanel,
  bottomPanelTitle,
  onRelatedTabChange,
  enableRelatedSearch = false,
  onRelatedSearchChange,
  deckCardClassName,
}: StandardFormDrawerProps) {
  const t = useT();
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(
    rightPanelDefaultCollapsed,
  );

  useEffect(() => {
    if (open) {
      setRightPanelCollapsed(rightPanelDefaultCollapsed);
    }
  }, [open, rightPanelDefaultCollapsed]);

  const isRightPanelCollapsible =
    collapsibleRightPanel !== undefined
      ? collapsibleRightPanel
      : (layout === "2-columns" && Boolean(rightPanel) && !hideRightPanel) ||
        Boolean(rightPanelTitle);

  // view mode: border-primary outline, hover fills primary bg
  const headerExtra = (
    <div className="flex items-center gap-2">
      {mode === "view" && onToggleEdit && (
        <button
          type="button"
          onClick={onToggleEdit}
          className="px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg"
        >
          {t("Chỉnh sửa")}
        </button>
      )}
      {!hideRightPanel && rightPanel && isRightPanelCollapsible && (
        <div
          className={cn(
            "flex items-center",
            mode === "view" &&
              onToggleEdit &&
              "border-l pl-2 ml-1 border-border/60",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setRightPanelCollapsed((s) => !s)}
            className="text-[color:var(--faint)] hover:text-foreground"
            title={
              rightPanelCollapsed
                ? t("Mở rộng cột phải")
                : t("Thu gọn cột phải")
            }
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );

  // Resolve size → className (layout default: 1-column → sm, 2-columns → xl)
  const resolvedSize = size ?? (layout === "1-column" ? "sm" : "xl");
  const defaultPanelClassName = SIZE_CLASS[resolvedSize];

  const hasRelatedContent = Boolean(
    bottomPanel || (relatedTabs && relatedTabs.length > 0),
  );

  const innerContent = (
    <>
      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-4 flex-shrink-0">
          {error}
        </div>
      )}
      {loading ? (
        <FormLoadingSkeleton />
      ) : layout === "1-column" ? (
        // 1-column: render leftPanel raw — caller uses DrawerSection/DrawerField directly
        <div className="w-full h-auto flex flex-col flex-1 min-h-0">
          {leftPanel}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col lg:flex-row items-start w-full max-w-full relative h-auto transition-all duration-300",
            rightPanelCollapsed ? "gap-0" : "gap-6",
          )}
        >
          {/* Cột trái: Chi tiết / Main Content */}
          <div className="flex-1 min-w-0 w-full order-2 lg:order-1 space-y-4">
            {leftPanel}
          </div>

          {/* Cột phải: Thông tin chung / Metadata */}
          {!hideRightPanel &&
            rightPanel &&
            (rightPanelTitle !== undefined || isRightPanelCollapsible ? (
              <div
                className={cn(
                  "shrink-0 order-1 lg:order-2 space-y-4 transition-all duration-300 overflow-x-hidden p-0.5 pb-3",
                  stickyRightPanel && "lg:sticky lg:top-0",
                  rightPanelCollapsed
                    ? "w-full lg:w-0 h-0 lg:h-auto opacity-0 overflow-hidden !p-0"
                    : "w-full lg:w-[300px] xl:w-[320px] 2xl:w-[360px] opacity-100",
                )}
              >
                {rightPanelTitle !== undefined ? (
                  <DrawerSection title={rightPanelTitle}>
                    <div
                      className={cn(
                        "w-full",
                        stickyRightPanel
                          ? "overflow-x-hidden overflow-y-auto lg:max-h-[calc(100vh-190px)] pb-2"
                          : "overflow-x-hidden overflow-y-visible pb-1",
                      )}
                      style={
                        stickyRightPanel
                          ? { scrollbarWidth: "none" }
                          : undefined
                      }
                    >
                      <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
                        {rightPanel}
                      </div>
                    </div>
                  </DrawerSection>
                ) : (
                  <div
                    className={cn(
                      "w-full",
                      stickyRightPanel
                        ? "overflow-x-hidden overflow-y-auto lg:max-h-[calc(100vh-190px)] pb-2"
                        : "overflow-x-hidden overflow-y-visible pb-1",
                    )}
                    style={
                      stickyRightPanel ? { scrollbarWidth: "none" } : undefined
                    }
                  >
                    <div className="flex flex-col min-w-[280px]">
                      {rightPanel}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "shrink-0 order-1 lg:order-2 w-full lg:w-[300px] xl:w-[320px] 2xl:w-[360px] p-0.5 pb-3",
                  stickyRightPanel && "lg:sticky lg:top-0",
                )}
              >
                {rightPanel}
              </div>
            ))}
        </div>
      )}

      {/* ── Horizon Divider & Connected Context Deck ── */}
      {hasRelatedContent && (
        <DrawerRelatedDeck
          tabs={relatedTabs}
          defaultTabKey={defaultRelatedTabKey}
          defaultCollapsed={defaultRelatedCollapsed}
          customContent={bottomPanel}
          customTitle={bottomPanelTitle}
          onTabChange={onRelatedTabChange}
          enableSearch={enableRelatedSearch}
          onSearchChange={onRelatedSearchChange}
          cardClassName={deckCardClassName}
        />
      )}
    </>
  );

  if (asContent) {
    return (
      <div className="h-full w-full flex flex-col relative">{innerContent}</div>
    );
  }

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={icon}
      confirmOnClose={confirmOnClose}
      headerExtra={headerExtra}
      panelClassName={cn(defaultPanelClassName, panelClassName)}
      bodyClassName={bodyClassName}
      title={title}
      titleExtra={titleExtra}
      subtitle={subtitle}
      actions={actions}
      zIndex={zIndex}
      noAnimation={noAnimation}
      footerLeft={footerLeft}
    >
      {innerContent}
    </DrawerModal>
  );
}
