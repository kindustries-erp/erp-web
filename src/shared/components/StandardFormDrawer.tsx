import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DrawerModal, DrawerSection, type DrawerAction } from "./DrawerModal";
import { useT } from "@/core/i18n";
import { ChevronRight, ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import type { DrawerMode } from "../stores/useDrawerStore";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";
import {
  DrawerRelatedDeck,
  type DrawerRelatedTabItem,
} from "./drawer/DrawerRelatedDeck";
import {
  DrawerTopTabBar,
  type DrawerTopTabItem,
} from "./drawer/DrawerTopTabBar";
import { TabSlideTransition } from "./TabSlideTransition";

export type { DrawerRelatedTabItem, DrawerTopTabItem };
export * from "./drawer";

// ── Size presets ──────────────────────────────────────────────────────────────
// All sizes scale fluidly via `vw` on desktop while bounded by explicit min/max widths
// and hard bounded by max-width: calc(100vw - 208px) on desktop so drawer never covers sidebar.
const SIZE_CLASS: Record<string, string> = {
  sm: "w-full md:w-[90vw] lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw] min-w-[420px] max-w-[660px]",
  md: "w-full md:w-[92vw] lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw] min-w-[620px] max-w-[980px]",
  lg: "w-full md:w-[95vw] lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw] min-w-[840px] max-w-[1380px]",
  xl: "w-full md:w-[96vw] lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw] min-w-[1020px] max-w-[1780px]",
  full: "w-full md:w-[98vw] lg:w-[calc(100vw-208px)] xl:w-[calc(100vw-208px)] max-w-[calc(100vw-208px)] min-w-[1020px]",
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
   * Bật nút phóng to Toàn màn hình (Full Screen Mode) cho Drawer.
   * Mặc định là true khi layout là "2-columns".
   */
  enableFullscreen?: boolean;

  /** Trạng thái toàn màn hình (controlled) */
  isFullscreen?: boolean;

  /** Trạng thái toàn màn hình mặc định khi mở (mặc định: false) */
  defaultFullscreen?: boolean;

  /** Callback khi thay đổi trạng thái toàn màn hình */
  onFullscreenChange?: (isFullscreen: boolean) => void;

  /**
   * Panel width preset. Ignored when `panelClassName` overrides width explicitly.
   * - sm  : ~420–660px — 1-column simple forms (profile, tags)
   * - md  : ~620–980px — medium-complexity forms (master data, categories)
   * - lg  : ~840–1380px — default 2-column (partners, customers, configs)
   * - xl  : ~1020–1780px (~90vw on desktop) — wide multi-facet documents (Invoices, PO, Sales, Production, Quotations)
   * - full: calc(100vw - 208px) — max available within sidebar constraint (traceability graph, large reports)
   * Defaults to "sm" for 1-column, "xl" for 2-columns.
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * When true, show a confirm dialog before closing (passed through to DrawerModal).
   * Useful for edit-mode forms that may have unsaved changes.
   */
  confirmOnClose?: boolean;

  /**
   * Danh sách các tab điều hướng phía trên (Top Tabs).
   * Khi truyền prop này, nội dung tab được kích hoạt sẽ hiển thị ở khu vực Left Panel (hoặc Full Width nếu tab có hideRightPanel).
   */
  tabs?: DrawerTopTabItem[];

  /** Tab đang hoạt động (controlled) */
  activeTabKey?: string;

  /** Tab mặc định được kích hoạt trong tabs */
  defaultTabKey?: string;

  /** Callback khi chuyển tab phía trên */
  onTabChange?: (tabKey: string) => void;

  /** Phần tử tùy chỉnh hiển thị ở góc phải của thanh Top Tab Bar */
  tabBarExtra?: React.ReactNode;

  /** ClassName bổ sung cho thanh Top Tab Bar */
  tabBarClassName?: string;

  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;

  /** Allows overriding the default wide panel width class */
  panelClassName?: string;

  /** Hide right panel completely if not needed */
  hideRightPanel?: boolean;

  /** Title for the standard right panel. If provided, the right panel will be wrapped in a collapsible DrawerSection */
  rightPanelTitle?: React.ReactNode;

  /** Extra element rendered on the right side of the right panel section header */
  rightPanelTitleExtra?: React.ReactNode;

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
  enableFullscreen,
  isFullscreen: controlledFullscreen,
  defaultFullscreen = false,
  onFullscreenChange,
  tabs,
  activeTabKey,
  defaultTabKey,
  onTabChange,
  tabBarExtra,
  tabBarClassName,
  leftPanel,
  rightPanel,
  panelClassName,
  bodyClassName,
  hideRightPanel = false,
  rightPanelTitle,
  rightPanelTitleExtra,
  rightPanelDefaultCollapsed = false,
  stickyRightPanel = false,
  collapsibleRightPanel,
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
  deckCardClassName,
}: StandardFormDrawerProps) {
  const t = useT();
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(
    rightPanelDefaultCollapsed,
  );
  const [internalFullscreen, setInternalFullscreen] =
    useState(defaultFullscreen);

  const isFullscreen =
    controlledFullscreen !== undefined
      ? controlledFullscreen
      : internalFullscreen;

  const isFullscreenEnabled =
    enableFullscreen !== undefined ? enableFullscreen : layout === "2-columns";

  const handleToggleFullscreen = useCallback(() => {
    const next = !isFullscreen;
    setInternalFullscreen(next);
    onFullscreenChange?.(next);
  }, [isFullscreen, onFullscreenChange]);

  // Intercept Escape key when in fullscreen mode to exit fullscreen first
  useEffect(() => {
    if (!open || !isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [open, isFullscreen, handleToggleFullscreen]);

  const [internalTabKey, setInternalTabKey] = useState<string>(() => {
    if (activeTabKey) return activeTabKey;
    if (defaultTabKey && tabs?.some((t) => t.key === defaultTabKey)) {
      return defaultTabKey;
    }
    return tabs && tabs.length > 0 ? tabs[0].key : "";
  });

  const effectiveTabKey = useMemo(() => {
    if (activeTabKey !== undefined) return activeTabKey;
    if (internalTabKey && tabs?.some((t) => t.key === internalTabKey)) {
      return internalTabKey;
    }
    if (defaultTabKey && tabs?.some((t) => t.key === defaultTabKey)) {
      return defaultTabKey;
    }
    return tabs && tabs.length > 0 ? tabs[0].key : "";
  }, [activeTabKey, internalTabKey, defaultTabKey, tabs]);

  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setRightPanelCollapsed(rightPanelDefaultCollapsed);
      setInternalFullscreen(defaultFullscreen);
      if (activeTabKey) {
        setInternalTabKey(activeTabKey);
      } else if (defaultTabKey && tabs?.some((t) => t.key === defaultTabKey)) {
        setInternalTabKey(defaultTabKey);
      } else if (tabs && tabs.length > 0) {
        setInternalTabKey(tabs[0].key);
      }
    }
    prevOpenRef.current = open;
  }, [
    open,
    rightPanelDefaultCollapsed,
    defaultFullscreen,
    activeTabKey,
    defaultTabKey,
    tabs,
  ]);

  useEffect(() => {
    if (tabs && tabs.length > 0) {
      if (!internalTabKey || !tabs.some((t) => t.key === internalTabKey)) {
        const fallback =
          defaultTabKey && tabs.some((t) => t.key === defaultTabKey)
            ? defaultTabKey
            : tabs[0].key;
        setInternalTabKey(fallback);
      }
    }
  }, [tabs, defaultTabKey, internalTabKey]);

  useEffect(() => {
    if (activeTabKey !== undefined) {
      setInternalTabKey(activeTabKey);
    }
  }, [activeTabKey]);

  const handleTabChange = (key: string) => {
    setInternalTabKey(key);
    onTabChange?.(key);
  };

  const activeTopTab =
    tabs?.find((t) => t.key === effectiveTabKey) || tabs?.[0];
  const effectiveHideRightPanel =
    hideRightPanel || (activeTopTab?.hideRightPanel ?? false);
  const effectiveLeftContent = activeTopTab ? activeTopTab.content : leftPanel;
  const renderedLeftContent =
    tabs && tabs.length > 0 ? (
      <TabSlideTransition
        activeKey={effectiveTabKey}
        tabKeys={tabs.map((t) => t.key)}
        className="w-full flex-1 min-h-0"
      >
        {effectiveLeftContent}
      </TabSlideTransition>
    ) : (
      effectiveLeftContent
    );
  const effectiveRightPanel =
    activeTopTab?.rightPanel !== undefined
      ? activeTopTab.rightPanel
      : rightPanel;

  const isRightPanelCollapsible =
    collapsibleRightPanel !== undefined
      ? collapsibleRightPanel
      : (layout === "2-columns" &&
          Boolean(effectiveRightPanel) &&
          !effectiveHideRightPanel) ||
        Boolean(rightPanelTitle);

  const hasRightPanelToggle =
    !effectiveHideRightPanel && effectiveRightPanel && isRightPanelCollapsible;

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
      {(isFullscreenEnabled || hasRightPanelToggle) && (
        <div
          className={cn(
            "flex items-center gap-1",
            mode === "view" &&
              onToggleEdit &&
              "border-l pl-2 ml-1 border-border/60",
          )}
        >
          {isFullscreenEnabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleFullscreen}
              className="text-[color:var(--faint)] hover:text-foreground h-7 w-7 p-0 flex items-center justify-center"
              title={
                isFullscreen
                  ? t("Thu nhỏ (Esc)", "Exit Fullscreen (Esc)")
                  : t("Toàn màn hình", "Fullscreen")
              }
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          {hasRightPanelToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setRightPanelCollapsed((s) => !s)}
              className="text-[color:var(--faint)] hover:text-foreground h-7 w-7 p-0 flex items-center justify-center"
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
          )}
        </div>
      )}
    </div>
  );

  // Resolve size → className (layout default: 1-column → sm, 2-columns → xl; fullscreen → full)
  const resolvedSize = isFullscreen
    ? "full"
    : (size ?? (layout === "1-column" ? "sm" : "xl"));
  const defaultPanelClassName = SIZE_CLASS[resolvedSize];

  const hasRelatedContent = Boolean(
    bottomPanel || (relatedTabs && relatedTabs.length > 0),
  );

  const innerContent = (
    <>
      {/* ── Top Navigation Tab Bar (nếu có tabs) ── */}
      {tabs && tabs.length > 0 && (
        <DrawerTopTabBar
          tabs={tabs}
          activeTabKey={effectiveTabKey}
          onTabChange={handleTabChange}
          extra={tabBarExtra}
          className={tabBarClassName}
        />
      )}

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-4 flex-shrink-0">
          {error}
        </div>
      )}
      {loading ? (
        <FormLoadingSkeleton />
      ) : layout === "1-column" ? (
        // 1-column: render raw content — caller uses DrawerSection/DrawerField directly
        <div className="w-full h-auto flex flex-col flex-1 min-h-0">
          {renderedLeftContent}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col lg:flex-row items-start w-full max-w-full relative h-auto transition-all duration-300",
            rightPanelCollapsed ? "gap-0" : "gap-6",
          )}
        >
          {/* Cột trái: Chi tiết / Main Content / Tab Content */}
          <div className="flex-1 min-w-0 w-full order-2 lg:order-1 space-y-4">
            {renderedLeftContent}
          </div>

          {/* Cột phải: Thông tin chung / Metadata */}
          {!effectiveHideRightPanel &&
            effectiveRightPanel &&
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
                  <DrawerSection
                    title={rightPanelTitle}
                    titleExtra={rightPanelTitleExtra}
                  >
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
                        {effectiveRightPanel}
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
                      {effectiveRightPanel}
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
                {effectiveRightPanel}
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
      panelClassName={cn(
        defaultPanelClassName,
        isFullscreen && "fullscreen-drawer",
        panelClassName,
      )}
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
