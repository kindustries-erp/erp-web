import * as React from "react";
import { Filter } from "lucide-react";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import {
  V2TabBar,
  V2TabBarVariant,
} from "@/v2/shared/components/molecules/v2-tab-bar";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  buildFilterDrawerActions,
  buildFilterDrawerTabs,
} from "./V2TableFilterDrawer.actions";
import { V2TableFilterDrawerBody } from "./V2TableFilterDrawer.body";
import type { V2TableFilterDrawerProps } from "./V2TableFilterDrawer.type";
import {
  useV2FilterDrawerTab,
  type V2FilterDrawerTab,
} from "./V2TableFilterDrawer.ui.hook";

/** Bản mobile: bottom sheet cao 85dvh, footer nằm dưới cùng trong vùng an toàn */
export function V2TableFilterDrawerMobile<T>(
  props: V2TableFilterDrawerProps<T>,
) {
  const { t } = useV2Translation();
  const { panel, state, presets } = props;
  const { activeTab, setTab } = useV2FilterDrawerTab(Boolean(presets));
  const tabs = buildFilterDrawerTabs(t, presets?.presets.length);
  const activeCount = state.activeFilterCount;

  return (
    <V2BottomSheet
      open={panel.open}
      onOpenChange={(open) => {
        if (!open) panel.close();
      }}
      title={t("v2.table.filterPanelTitle")}
      icon={<Filter className="h-4 w-4" />}
      closeAriaLabel={t("v2.table.closePanel")}
      maxHeightClass="h-[85dvh] max-h-[85dvh]"
      bodyClassName="flex min-h-0 flex-col p-0"
      footer={
        <div className="pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
          <DrawerFooter
            actions={buildFilterDrawerActions({
              activeCount,
              onReset: state.resetAll,
              onClose: panel.close,
              t,
            })}
          />
        </div>
      }
    >
      {tabs && (
        <V2TabBar
          variant={V2TabBarVariant.HEADER}
          tabs={tabs}
          activeTabKey={activeTab}
          onTabChange={(key) => setTab(key as V2FilterDrawerTab)}
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <V2TableFilterDrawerBody {...props} tab={activeTab} />
      </div>
    </V2BottomSheet>
  );
}
