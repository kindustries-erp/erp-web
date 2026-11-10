import * as React from "react";
import { Filter } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { DrawerFooter } from "@/v2/shared/components/molecules/v2-drawer-footer";
import { DrawerHeader } from "@/v2/shared/components/molecules/v2-drawer-header";
import { V2DrawerSheet } from "@/v2/shared/components/molecules/v2-drawer-sheet";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
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

/** Bản desktop: Sheet nổi bên phải; bảng phía sau vẫn thấy và cập nhật khi lọc */
export function V2TableFilterDrawerDesktop<T>(
  props: V2TableFilterDrawerProps<T>,
) {
  const { t } = useV2Translation();
  const { panel, state, presets } = props;
  const { activeTab, setTab } = useV2FilterDrawerTab(Boolean(presets));
  const tabs = buildFilterDrawerTabs(t, presets?.presets.length);
  const activeCount = state.activeFilterCount;
  const title = t("v2.table.filterPanelTitle");

  return (
    <V2DrawerSheet
      open={panel.open}
      onRequestClose={panel.close}
      side="floating"
      title={title}
      className="flex w-full min-w-0 flex-col overflow-hidden p-0 md:w-[90vw] lg:w-[42vw] lg:min-w-[420px] lg:max-w-[660px]"
    >
      <DrawerHeader
        title={title}
        icon={<Filter className="h-4 w-4" />}
        titleExtra={
          activeCount > 0 ? (
            <V2Text
              as="span"
              variant="caption"
              weight="semibold"
              data-testid="filter-drawer-count"
            >
              ({activeCount})
            </V2Text>
          ) : undefined
        }
        onClose={panel.close}
        closeAriaLabel={t("v2.table.closePanel")}
      />
      {tabs && (
        <V2TabBar
          variant="header"
          tabs={tabs}
          activeTabKey={activeTab}
          onTabChange={(key) => setTab(key as V2FilterDrawerTab)}
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-[18px]">
        <V2TableFilterDrawerBody {...props} tab={activeTab} />
      </div>
      <DrawerFooter
        actions={buildFilterDrawerActions({
          activeCount,
          onReset: state.resetAll,
          onClose: panel.close,
          t,
        })}
      />
    </V2DrawerSheet>
  );
}
