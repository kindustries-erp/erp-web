import React from "react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { DrawerRelatedDeck } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { V2Divider } from "@/v2/shared/components/atoms/v2-divider";
import type { useStandardDrawer } from "./V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

interface DrawerMobilePanelsProps {
  props: V2StandardDrawerProps;
  h: ReturnType<typeof useStandardDrawer>;
  mainContent: React.ReactNode;
  hasRelated: boolean;
}

export const DrawerMobilePanels: React.FC<DrawerMobilePanelsProps> = ({
  props,
  h,
  mainContent,
  hasRelated,
}) => {
  return (
    <V2Stack gap="sm">
      <V2Stack gap="xs">
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
      </V2Stack>

      {props.rightPanel && !h.activeTabItem?.hideRightPanel && (
        <V2Stack gap="xs" data-testid="drawer-mobile-stacked-panel">
          <V2Divider orientation="horizontal" className="bg-border/50" />
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
        </V2Stack>
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
    </V2Stack>
  );
};
