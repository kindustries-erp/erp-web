import { useState, useEffect } from "react";
import { DrawerModal, DrawerSection, type DrawerAction } from "./DrawerModal";
import { Button } from "./ui/Button";
import { useT } from "@/core/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import type { DrawerMode } from "../stores/useDrawerStore";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";

export interface StandardFormDrawerProps {
  open: boolean;
  mode: DrawerMode;
  onClose: () => void;
  onToggleEdit?: () => void;

  title: string;
  titleExtra?: React.ReactNode;
  subtitle?: React.ReactNode;

  actions?: DrawerAction[];

  loading?: boolean;
  error?: string | null;

  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;

  /** Allows overriding the default wide panel width class */
  panelClassName?: string;

  /** Hide right panel completely if not needed */
  hideRightPanel?: boolean;

  /** Title for the standard right panel. If provided, the right panel will be wrapped in a collapsible DrawerSection */
  rightPanelTitle?: React.ReactNode;

  /** Default collapsed state for the right panel */
  rightPanelDefaultCollapsed?: boolean;
}

export function StandardFormDrawer({
  open,
  mode,
  onClose,
  onToggleEdit,
  title,
  titleExtra,
  subtitle,
  actions,
  loading,
  error,
  leftPanel,
  rightPanel,
  panelClassName,
  hideRightPanel = false,
  rightPanelTitle,
  rightPanelDefaultCollapsed = false,
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

  // When in view mode and an edit toggle is provided, show the Edit button.
  const headerExtra =
    mode === "view" && onToggleEdit ? (
      <Button variant="secondary" size="sm" onClick={onToggleEdit}>
        {t("Chỉnh sửa")}
      </Button>
    ) : undefined;

  const defaultPanelClassName =
    "w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]";

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      headerExtra={headerExtra}
      panelClassName={cn(defaultPanelClassName, panelClassName)}
      title={title}
      titleExtra={titleExtra}
      subtitle={subtitle}
      actions={actions}
    >
      {loading ? (
        <FormLoadingSkeleton />
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-full relative h-full">
          {/* Cột trái: Chi tiết / Main Content */}
          <div className="flex-1 min-w-0 w-full order-2 xl:order-1 space-y-4">
            {leftPanel}
          </div>

          {/* Cột phải: Thông tin chung / Metadata */}
          {!hideRightPanel &&
            rightPanel &&
            (rightPanelTitle ? (
              <div
                className={cn(
                  "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300 xl:sticky xl:top-0",
                  rightPanelCollapsed
                    ? "w-full xl:w-[52px]"
                    : "w-full xl:w-[320px] 2xl:w-[360px]",
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
                      className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)]"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
                        {rightPanel}
                      </div>
                    </div>
                  </div>
                </DrawerSection>
              </div>
            ) : (
              <div className="shrink-0 order-1 xl:order-2 w-full xl:w-auto xl:sticky xl:top-0">
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
