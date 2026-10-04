import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerRelatedDeck } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardDrawer } from "./V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

export const V2StandardDrawerDesktop: React.FC<V2StandardDrawerProps> = (
  props,
) => {
  const h = useStandardDrawer(props);
  const mainContent =
    h.activeLeftTabItem?.content ||
    h.activeTabItem?.content ||
    props.leftPanel ||
    props.children;
  const showRight =
    h.effectiveLayout === "2-columns" &&
    props.rightPanel &&
    !h.isRightPanelCollapsed;
  const hasRelated = Boolean(
    props.bottomPanel || (props.relatedTabs && props.relatedTabs.length > 0),
  );

  return (
    <>
      <Sheet
        open={props.open}
        onOpenChange={(v) => (!v ? h.requestClose() : undefined)}
      >
        <SheetContent
          side={h.isFullscreen ? "fullscreen" : "floating"}
          hideCloseButton
          className={cn(
            "p-0 flex flex-col overflow-hidden",
            h.sizeClass,
            props.panelClassName,
            props.className,
          )}
        >
          <SheetTitle className="sr-only">
            {typeof props.title === "string"
              ? `${props.title} Dialog`
              : "Drawer Dialog"}
          </SheetTitle>

          <DrawerHeader
            title={props.title}
            titleExtra={props.titleExtra}
            subtitle={props.subtitle}
            icon={props.icon}
            onClose={h.requestClose}
            onToggleEdit={props.onToggleEdit}
            isEditing={props.mode === "edit"}
            enableFullscreen={h.enableFullscreen}
            isFullscreen={h.isFullscreen}
            onToggleFullscreen={h.toggleFullscreen}
            collapsibleRightPanel={h.collapsibleRightPanel}
            isRightPanelCollapsed={h.isRightPanelCollapsed}
            onToggleRightPanel={h.toggleRightPanel}
            closeAriaLabel={props.closeAriaLabel}
            isScrolledTop={h.isScrolledTop}
          />

          {props.tabs && props.tabs.length > 0 && (
            <V2TabBar
              variant="header"
              tabs={props.tabs}
              activeTabKey={h.activeTabKey}
              onTabChange={h.handleTabChange}
              extra={props.tabBarExtra}
            />
          )}

          <div
            ref={h.scrollContainerRef}
            className={cn(
              "flex-1 overflow-y-auto min-h-0 flex flex-col p-3 sm:p-4 md:p-[18px]",
              props.bodyClassName,
            )}
          >
            {props.loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                <V2Text variant="body-sm" className="text-muted-foreground">
                  Đang tải dữ liệu...
                </V2Text>
              </div>
            ) : props.error ? (
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <V2Text
                  variant="body-sm"
                  className="text-destructive font-medium"
                >
                  {props.error}
                </V2Text>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                  <div className="flex-1 min-w-0 w-full space-y-3 sm:space-y-4">
                    {props.leftTabs && props.leftTabs.length > 0 && (
                      <V2TabBar
                        variant="sub"
                        tabs={props.leftTabs}
                        activeTabKey={h.activeLeftTabKey}
                        onTabChange={h.handleLeftTabChange}
                        extra={props.leftTabExtra}
                      />
                    )}
                    {mainContent}
                  </div>
                  {showRight && (
                    <div
                      data-testid="drawer-desktop-right-panel"
                      className={cn(
                        "w-full lg:w-72 xl:w-80 2xl:w-88 shrink-0 space-y-3 sm:space-y-4",
                        props.stickyRightPanel && "lg:sticky lg:top-0",
                      )}
                    >
                      {props.rightTabs && props.rightTabs.length > 0 && (
                        <V2TabBar
                          variant="sub"
                          tabs={props.rightTabs}
                          activeTabKey={h.activeRightTabKey}
                          onTabChange={h.handleRightTabChange}
                          extra={props.rightTabExtra}
                        />
                      )}
                      {h.activeRightTabItem?.content || props.rightPanel}
                    </div>
                  )}
                </div>
                {hasRelated && (
                  <DrawerRelatedDeck
                    tabs={props.relatedTabs}
                    defaultTabKey={props.defaultRelatedTabKey}
                    defaultCollapsed={props.defaultRelatedCollapsed}
                    customContent={props.bottomPanel}
                    customTitle={props.bottomPanelTitle}
                    onTabChange={props.onRelatedTabChange}
                    cardClassName={props.deckCardClassName}
                  />
                )}
              </div>
            )}
          </div>

          <DrawerFooter
            actions={props.actions}
            actionGroups={props.actionGroups}
            actionDropdownItems={props.actionDropdownItems}
            actionDropdownTriggerLabel={props.actionDropdownTriggerLabel}
            footerLeft={props.footerLeft}
            isScrolledBottom={h.isScrolledBottom}
          />
        </SheetContent>
      </Sheet>

      <V2ConfirmModal
        open={h.showConfirmClose}
        onOpenChange={(v) => !v && h.cancelClose()}
        title="Xác nhận đóng biểu mẫu"
        message="Biểu mẫu đang ở chế độ chỉnh sửa. Bạn có chắc chắn muốn đóng và hủy các thay đổi chưa lưu?"
        confirmLabel="Đóng không lưu"
        cancelLabel="Tiếp tục chỉnh sửa"
        variant="danger"
        onConfirm={h.confirmClose}
        onCancel={h.cancelClose}
      />
    </>
  );
};
