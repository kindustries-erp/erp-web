import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { DrawerTopTabBar } from "@/v2/shared/components/molecules/v2-drawer-top-tab-bar";
import { DrawerSubTabBar } from "@/v2/shared/components/molecules/v2-drawer-sub-tab-bar";
import { DrawerRelatedDeck } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardFormDrawer } from "./V2StandardFormDrawer.hook";
import type { V2StandardFormDrawerProps } from "./V2StandardFormDrawer.type";

export const V2StandardFormDrawerMobile: React.FC<V2StandardFormDrawerProps> = (
  props,
) => {
  const h = useStandardFormDrawer(props);
  const mainContent =
    h.activeLeftTabItem?.content ||
    h.activeTabItem?.content ||
    props.leftPanel ||
    props.children;
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
          side="bottom"
          hideCloseButton
          className={cn(
            "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
            "w-full max-w-none rounded-t-2xl rounded-b-none h-[100dvh] max-h-[100dvh]",
            "flex flex-col p-0 overflow-hidden border-b-0 border-t border-border/80",
            "pt-[env(safe-area-inset-top,0px)]",
            props.panelClassName,
            props.className,
          )}
        >
          <div
            data-testid="drawer-mobile-grab-handle"
            className="w-10 h-1 bg-muted-fg/30 rounded-full mx-auto my-1.5 shrink-0"
            aria-hidden="true"
          />

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
            closeAriaLabel={props.closeAriaLabel}
            isScrolledTop={h.isScrolledTop}
          />

          {props.tabs && props.tabs.length > 0 && (
            <DrawerTopTabBar
              tabs={props.tabs}
              activeTabKey={h.activeTabKey}
              onTabChange={h.handleTabChange}
              extra={props.tabBarExtra}
            />
          )}

          <div
            ref={h.scrollContainerRef}
            className={cn(
              "flex-1 overflow-y-auto min-h-0 p-3 sm:p-4",
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
              <div className="space-y-3">
                <div className="space-y-2">
                  {props.leftTabs && props.leftTabs.length > 0 && (
                    <DrawerSubTabBar
                      tabs={props.leftTabs}
                      activeTabKey={h.activeLeftTabKey}
                      onTabChange={h.handleLeftTabChange}
                      extra={props.leftTabExtra}
                    />
                  )}
                  {mainContent}
                </div>

                {props.rightPanel && !h.activeTabItem?.hideRightPanel && (
                  <div
                    data-testid="drawer-mobile-stacked-panel"
                    className="pt-2 border-t border-border/50 space-y-2"
                  >
                    {props.rightTabs && props.rightTabs.length > 0 && (
                      <DrawerSubTabBar
                        tabs={props.rightTabs}
                        activeTabKey={h.activeRightTabKey}
                        onTabChange={h.handleRightTabChange}
                        extra={props.rightTabExtra}
                      />
                    )}
                    {h.activeRightTabItem?.content || props.rightPanel}
                  </div>
                )}

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
