import { useState, useEffect, useRef } from "react";
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
import {
  DrawerTopTabBar,
  type DrawerTopTabItem,
} from "./drawer/DrawerTopTabBar";

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
  enableRelatedSearch = false,
  onRelatedSearchChange,
  deckCardClassName,
}: StandardFormDrawerProps) {
  const t = useT();
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(
    rightPanelDefaultCollapsed,
  );

  const [internalTabKey, setInternalTabKey] = useState<string>(() => {
    if (activeTabKey) return activeTabKey;
    if (defaultTabKey && tabs?.some((t) => t.key === defaultTabKey)) {
      return defaultTabKey;
    }
    return tabs && tabs.length > 0 ? tabs[0].key : "";
  });

  const currentTab = activeTabKey !== undefined ? activeTabKey : internalTabKey;

  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setRightPanelCollapsed(rightPanelDefaultCollapsed);
      if (activeTabKey) {
        setInternalTabKey(activeTabKey);
      } else if (defaultTabKey && tabs?.some((t) => t.key === defaultTabKey)) {
        setInternalTabKey(defaultTabKey);
      } else if (tabs && tabs.length > 0) {
        setInternalTabKey(tabs[0].key);
      }
    }
    prevOpenRef.current = open;
  }, [open, rightPanelDefaultCollapsed, activeTabKey, defaultTabKey, tabs]);

  useEffect(() => {
    if (activeTabKey !== undefined) {
      setInternalTabKey(activeTabKey);
    }
  }, [activeTabKey]);

  const handleTabChange = (key: string) => {
    setInternalTabKey(key);
    onTabChange?.(key);
  };

  const activeTopTab = tabs?.find((t) => t.key === currentTab) || tabs?.[0];
  const effectiveHideRightPanel =
    hideRightPanel || (activeTopTab?.hideRightPanel ?? false);
  const effectiveLeftContent = activeTopTab ? activeTopTab.content : leftPanel;

  const isRightPanelCollapsible =
    collapsibleRightPanel !== undefined
      ? collapsibleRightPanel
      : (layout === "2-columns" &&
          Boolean(rightPanel) &&
          !effectiveHideRightPanel) ||
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
      {!effectiveHideRightPanel && rightPanel && isRightPanelCollapsible && (
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
      {/* ── Top Navigation Tab Bar (nếu có tabs) ── */}
      {tabs && tabs.length > 0 && (
        <DrawerTopTabBar
          tabs={tabs}
          activeTabKey={currentTab}
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
          {effectiveLeftContent}
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
            {effectiveLeftContent}
          </div>

          {/* Cột phải: Thông tin chung / Metadata */}
          {!effectiveHideRightPanel &&
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
