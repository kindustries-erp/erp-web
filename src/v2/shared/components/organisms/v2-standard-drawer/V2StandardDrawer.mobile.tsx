import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerRelatedDeck } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import { DrawerConfirmCloseModal } from "./V2StandardDrawer.confirm-modal";
import { DrawerStateGuard } from "./V2StandardDrawer.state-guard";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardDrawer } from "./V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

export const V2StandardDrawerMobile: React.FC<V2StandardDrawerProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const h = useStandardDrawer(props);
  const childrenCtx = {
    activeTabKey: h.activeTabKey,
    activeLeftTabKey: h.activeLeftTabKey,
    activeRightTabKey: h.activeRightTabKey,
  };
  const resolvedChildren =
    typeof props.children === "function"
      ? props.children(childrenCtx)
      : props.children;
  const mainContent =
    h.activeLeftTabItem?.content ||
    h.activeTabItem?.content ||
    props.leftPanel ||
    resolvedChildren;
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
            "flex flex-col p-0 overflow-hidden border-b-0 border-t border-border/80 pt-[env(safe-area-inset-top,0px)]",
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
              ? `${props.title} ${t("v2.modal.defaultTitle", "Hộp thoại")}`
              : t("v2.modal.defaultTitle", "Hộp thoại")}
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
              "flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 touch-pan-y [-webkit-overflow-scrolling:touch]",
              props.bodyClassName,
            )}
          >
            <DrawerStateGuard loading={props.loading} error={props.error}>
              <div className="space-y-3">
                <div className="space-y-2">
                  {props.leftTabs && props.leftTabs.length > 0 && (
                    <V2TabBar
                      variant="sub"
                      tabs={props.leftTabs}
                      activeTabKey={h.activeLeftTabKey}
                      onTabChange={h.handleLeftTabChange}
                      extra={props.leftTabExtra}
                    />
                  )}
                  <div
                    key={h.activeTabKey || "tab-content"}
                    className="w-full animate-in fade-in-50 duration-200"
                  >
                    {mainContent}
                  </div>
                </div>

                {props.rightPanel && !h.activeTabItem?.hideRightPanel && (
                  <div
                    data-testid="drawer-mobile-stacked-panel"
                    className="pt-2 border-t border-border/50 space-y-2"
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
            </DrawerStateGuard>
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

      <DrawerConfirmCloseModal
        open={h.showConfirmClose}
        onConfirm={h.confirmClose}
        onCancel={h.cancelClose}
      />
    </>
  );
};
