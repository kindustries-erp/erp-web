import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { DrawerTopTabBar } from "@/v2/shared/components/molecules/v2-drawer-top-tab-bar";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardFormDrawer } from "./V2StandardFormDrawer.hook";
import type { V2StandardFormDrawerProps } from "./V2StandardFormDrawer.type";

export const V2StandardFormDrawerMobile: React.FC<V2StandardFormDrawerProps> = (
  props,
) => {
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
    showConfirmClose,
    requestClose,
    confirmClose,
    cancelClose,
  } = useStandardFormDrawer(props);

  const mainContent = activeTabItem?.content || leftPanel || children;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => (!v ? requestClose() : undefined)}
      >
        <SheetContent
          side="bottom"
          hideCloseButton
          className={cn(
            "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
            "w-full max-w-none rounded-t-2xl rounded-b-none h-[100dvh] max-h-[100dvh]",
            "flex flex-col p-0 overflow-hidden border-b-0 border-t border-border/80",
            "pt-[env(safe-area-inset-top,0px)]",
            panelClassName,
            className,
          )}
        >
          {/* Mobile Grab Handle Bar */}
          <div
            data-testid="drawer-mobile-grab-handle"
            className="w-10 h-1 bg-muted-fg/30 rounded-full mx-auto my-1.5 shrink-0"
            aria-hidden="true"
          />

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
            closeAriaLabel={closeAriaLabel}
          />

          {/* Drawer Body Container */}
          <div
            className={cn(
              "flex-1 overflow-y-auto min-h-0",
              "p-3 sm:p-4",
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

            {/* Main Content Area */}
            <div className="space-y-3">
              <div>{mainContent}</div>

              {/* In Mobile: right panel content is gracefully stacked at the bottom if provided */}
              {rightPanel && !activeTabItem?.hideRightPanel && (
                <div
                  data-testid="drawer-mobile-stacked-panel"
                  className="pt-2 border-t border-border/50"
                >
                  {rightPanel}
                </div>
              )}
            </div>
          </div>

          {/* Master Drawer Footer with Safe Area */}
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
