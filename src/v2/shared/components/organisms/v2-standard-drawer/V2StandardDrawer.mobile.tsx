import React from "react";
import { V2DrawerSheet } from "@/v2/shared/components/molecules/v2-drawer-sheet";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2GrabHandle } from "@/v2/shared/components/atoms/v2-grab-handle";
import { DrawerConfirmCloseModal } from "./V2StandardDrawer.confirm-modal";
import { DrawerStateGuard } from "./V2StandardDrawer.state-guard";
import { DrawerMobilePanels } from "./V2StandardDrawer.mobile-panels";
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

  const mobileTop =
    h.mobileTopOffsetPx > 0
      ? `calc(env(safe-area-inset-top, 0px) + ${h.mobileTopOffsetPx}px)`
      : "env(safe-area-inset-top, 0px)";
  const mobileHeight =
    h.mobileTopOffsetPx > 0
      ? `calc(100dvh - env(safe-area-inset-top, 0px) - ${h.mobileTopOffsetPx}px)`
      : "100dvh";
  const drawerTitle =
    typeof props.title === "string"
      ? `${props.title} ${t("v2.modal.defaultTitle", "Hộp thoại")}`
      : t("v2.modal.defaultTitle", "Hộp thoại");

  return (
    <>
      <V2DrawerSheet
        open={props.open}
        onRequestClose={h.requestClose}
        side="bottom"
        title={drawerTitle}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
          "w-full max-w-none rounded-t-2xl rounded-b-none flex flex-col p-0 overflow-hidden",
          "border-b-0 border-t border-border/80 transition-all duration-300 ease-out",
          h.isUnderlying && "scale-[0.97] opacity-85 origin-bottom",
          h.depth > 0 && "shadow-[0_-12px_32px_rgba(15,23,42,0.28)]",
          props.panelClassName,
          props.className,
        )}
        style={{
          zIndex: h.zIndex,
          top: mobileTop,
          height: mobileHeight,
          maxHeight: mobileHeight,
        }}
        overlayStyle={{ zIndex: h.zIndex - 1 }}
      >
        <V2GrabHandle data-testid="drawer-mobile-grab-handle" />

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
            <DrawerMobilePanels
              props={props}
              h={h}
              mainContent={mainContent}
              hasRelated={hasRelated}
            />
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
      </V2DrawerSheet>

      <DrawerConfirmCloseModal
        open={h.showConfirmClose}
        onConfirm={h.confirmClose}
        onCancel={h.cancelClose}
      />
    </>
  );
};
