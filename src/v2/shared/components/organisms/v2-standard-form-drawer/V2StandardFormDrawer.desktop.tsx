import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { DrawerTopTabBar } from "@/v2/shared/components/molecules/v2-drawer-top-tab-bar";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardFormDrawer } from "./V2StandardFormDrawer.hook";
import type { V2StandardFormDrawerProps } from "./V2StandardFormDrawer.type";

export const V2StandardFormDrawerDesktop: React.FC<
  V2StandardFormDrawerProps
> = (props) => {
  const {
    open,
    mode = "view",
    title,
    titleExtra,
    subtitle,
    icon,
    tabs,
    leftPanel,
    rightPanel,
    children,
    actions,
    footerLeft,
    onToggleEdit,
    className,
    panelClassName,
    bodyClassName,
    closeAriaLabel,
  } = props;

  const {
    activeTabKey,
    handleTabChange,
    activeTabItem,
    isFullscreen,
    toggleFullscreen,
    enableFullscreen,
    isRightPanelCollapsed,
    toggleRightPanel,
    collapsibleRightPanel,
    effectiveLayout,
    sizeClass,
    showConfirmClose,
    requestClose,
    confirmClose,
    cancelClose,
  } = useStandardFormDrawer(props);

  const mainContent = activeTabItem?.content || leftPanel || children;
  const showRightPanel =
    effectiveLayout === "2-columns" && rightPanel && !isRightPanelCollapsed;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => (!v ? requestClose() : undefined)}
      >
        <SheetContent
          side="right"
          hideCloseButton
          className={cn(
            "p-0 flex flex-col overflow-hidden max-h-screen border-l border-border/80",
            sizeClass,
            panelClassName,
            className,
          )}
        >
          {/* Accessible Title */}
          <SheetTitle className="sr-only">
            {typeof title === "string" ? `${title} Dialog` : "Drawer Dialog"}
          </SheetTitle>

          {/* Master Drawer Header */}
          <DrawerHeader
            title={title}
            titleExtra={titleExtra}
            subtitle={subtitle}
            icon={icon}
            onClose={requestClose}
            onToggleEdit={onToggleEdit}
            isEditing={mode === "edit"}
            enableFullscreen={enableFullscreen}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            collapsibleRightPanel={collapsibleRightPanel}
            isRightPanelCollapsed={isRightPanelCollapsed}
            onToggleRightPanel={toggleRightPanel}
            closeAriaLabel={closeAriaLabel}
          />

          {/* Drawer Body Container */}
          <div
            className={cn(
              "flex-1 overflow-hidden flex flex-col min-h-0",
              "p-3 sm:p-4 md:p-[18px]",
              bodyClassName,
            )}
          >
            {/* Top Navigation Tabs */}
            {tabs && tabs.length > 1 && (
              <DrawerTopTabBar
                tabs={tabs}
                activeTabKey={activeTabKey}
                onTabChange={handleTabChange}
              />
            )}

            {/* Layout Panels */}
            <div className="flex-1 flex min-h-0 gap-3 sm:gap-4 overflow-hidden">
              {/* Left / Main Panel */}
              <div className="flex-1 min-w-0 overflow-y-auto pr-0.5">
                {mainContent}
              </div>

              {/* Right Panel (Desktop 3-Tier Architecture) */}
              {showRightPanel && (
                <div
                  data-testid="drawer-desktop-right-panel"
                  className={cn(
                    "w-72 lg:w-80 xl:w-88 shrink-0 overflow-y-auto pl-3 sm:pl-4",
                    "border-l border-border/60 transition-all duration-200",
                  )}
                >
                  {rightPanel}
                </div>
              )}
            </div>
          </div>

          {/* Master Drawer Footer */}
          <DrawerFooter actions={actions} footerLeft={footerLeft} />
        </SheetContent>
      </Sheet>

      {/* Close Confirm Modal when in Edit mode */}
      <V2ConfirmModal
        open={showConfirmClose}
        onOpenChange={(v) => !v && cancelClose()}
        title="Xác nhận đóng biểu mẫu"
        message="Biểu mẫu đang ở chế độ chỉnh sửa. Bạn có chắc chắn muốn đóng và hủy các thay đổi chưa lưu?"
        confirmLabel="Đóng không lưu"
        cancelLabel="Tiếp tục chỉnh sửa"
        variant="danger"
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
};
