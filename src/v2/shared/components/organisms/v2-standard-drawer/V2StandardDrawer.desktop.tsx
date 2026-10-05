import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerRelatedDeck } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import { DrawerConfirmCloseModal } from "./V2StandardDrawer.confirm-modal";
import { DrawerStateGuard } from "./V2StandardDrawer.state-guard";
import { DrawerDesktopColumns } from "./V2StandardDrawer.desktop-columns";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useStandardDrawer } from "./V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

export const V2StandardDrawerDesktop: React.FC<V2StandardDrawerProps> = (
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
          side={h.isFullscreen ? "fullscreen" : "floating"}
          hideCloseButton
          className={cn(
            "p-0 flex flex-col overflow-hidden transition-all duration-300 ease-out",
            h.sizeClass,
            props.panelClassName,
            props.className,
          )}
          style={{
            zIndex: h.zIndex,
            transform:
              !h.isFullscreen && h.desktopShiftPx > 0
                ? `translateX(-${h.desktopShiftPx}px)`
                : undefined,
          }}
          overlayStyle={{
            zIndex: h.zIndex - 1,
          }}
        >
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
            <DrawerStateGuard loading={props.loading} error={props.error}>
              <div className="flex flex-col gap-4">
                <DrawerDesktopColumns
                  props={props}
                  h={h}
                  mainContent={mainContent}
                />
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
