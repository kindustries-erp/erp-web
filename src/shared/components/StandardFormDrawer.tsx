import { useState, useEffect } from "react";
import { DrawerModal, DrawerSection, type DrawerAction } from "./DrawerModal";
import { useT } from "@/core/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import type { DrawerMode } from "../stores/useDrawerStore";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";

// ── Size presets ──────────────────────────────────────────────────────────────
// All sizes are bounded by max-width: calc(100vw - 208px) on desktop (panels.css)
// so the drawer never covers the sidebar.
const SIZE_CLASS: Record<string, string> = {
  sm: "w-full md:w-[95vw] lg:w-[500px] xl:w-[500px] 2xl:w-[550px]",
  md: "w-full md:w-[95vw] lg:w-[700px] xl:w-[700px] 2xl:w-[750px]",
  lg: "w-full md:w-[95vw] lg:w-[1000px] xl:w-[1000px] 2xl:w-[1100px]",
  xl: "w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]",
  full: "w-full md:w-[95vw] lg:w-[90vw] xl:w-full 2xl:w-full",
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
  hideRightPanel = false,
  rightPanelTitle,
  rightPanelDefaultCollapsed = false,
  stickyRightPanel = true,
  zIndex,
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

  // view mode: border-primary outline, hover fills primary bg
  const headerExtra =
    mode === "view" && onToggleEdit ? (
      <button
        type="button"
        onClick={onToggleEdit}
        className="px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg"
      >
        {t("Chỉnh sửa")}
      </button>
    ) : undefined;

  // Resolve size → className (layout default: 1-column → sm, 2-columns → xl)
  const resolvedSize = size ?? (layout === "1-column" ? "sm" : "xl");
  const defaultPanelClassName = SIZE_CLASS[resolvedSize];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={icon}
      confirmOnClose={confirmOnClose}
      headerExtra={headerExtra}
      panelClassName={cn(defaultPanelClassName, panelClassName)}
      title={title}
      titleExtra={titleExtra}
      subtitle={subtitle}
      actions={actions}
      zIndex={zIndex}
    >
      {loading ? (
        <FormLoadingSkeleton />
      ) : layout === "1-column" ? (
        // 1-column: render leftPanel raw — caller uses DrawerSection/DrawerField directly
        <div className="w-full pb-4">{leftPanel}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-full relative h-full">
          {/* Cột trái: Chi tiết / Main Content */}
          <div className="flex-1 min-w-0 w-full order-2 lg:order-1 space-y-4">
            {leftPanel}
          </div>

          {/* Cột phải: Thông tin chung / Metadata */}
          {!hideRightPanel &&
            rightPanel &&
            (rightPanelTitle ? (
              <div
                className={cn(
                  "shrink-0 order-1 lg:order-2 space-y-4 transition-all duration-300",
                  stickyRightPanel && "lg:sticky lg:top-0",
                  rightPanelCollapsed
                    ? "w-full lg:w-[52px]"
                    : "w-full lg:w-[300px] xl:w-[320px] 2xl:w-[360px]",
                )}
              >
                <DrawerSection
                  title={
                    <span
                      className={cn(
                        "transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle",
                        rightPanelCollapsed
                          ? "max-w-0 opacity-0"
                          : "max-w-[200px] opacity-100",
                      )}
                    >
                      {rightPanelTitle}
                    </span>
                  }
                  titleExtra={
                    <button
                      type="button"
                      onClick={() => setRightPanelCollapsed((s) => !s)}
                      className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                      title={rightPanelCollapsed ? t("Mở rộng") : t("Thu gọn")}
                    >
                      {rightPanelCollapsed ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  }
                >
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      rightPanelCollapsed ? "opacity-0" : "opacity-100",
                    )}
                    style={{
                      gridTemplateRows: rightPanelCollapsed ? "0fr" : "1fr",
                    }}
                  >
                    <div
                      className={cn(
                        "w-full",
                        stickyRightPanel
                          ? "overflow-x-hidden overflow-y-auto lg:max-h-[calc(100vh-190px)]"
                          : "overflow-x-hidden overflow-y-visible",
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
                  </div>
                </DrawerSection>
              </div>
            ) : (
              <div
                className={cn(
                  "shrink-0 order-1 lg:order-2 w-full lg:w-[300px] xl:w-[320px] 2xl:w-[360px]",
                  stickyRightPanel && "lg:sticky lg:top-0",
                )}
              >
                {rightPanel}
              </div>
            ))}
        </div>
      )}

      {error && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3 flex-shrink-0">
          {error}
        </div>
      )}
    </DrawerModal>
  );
}
