import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";
import type { V2TabItemData } from "@/v2/shared/components/molecules/v2-tab-bar";

type Translate = (key: string, options?: Record<string, unknown>) => string;

interface FilterDrawerActionParams {
  activeCount: number;
  onReset: () => void;
  onClose: () => void;
  t: Translate;
}

/** Footer của drawer lọc: xóa tất cả điều kiện (bên trái) và đóng */
export function buildFilterDrawerActions({
  activeCount,
  onReset,
  onClose,
  t,
}: FilterDrawerActionParams): DrawerAction[] {
  return [
    {
      label: t("v2.table.resetAllFilters"),
      onClick: onReset,
      disabled: activeCount === 0,
      variant: "outline",
      align: "left",
    },
    {
      label: t("v2.table.filterDone"),
      onClick: onClose,
      primary: true,
      variant: "primary",
      align: "right",
    },
  ];
}

/** Tab của drawer lọc; chỉ có tab Bộ lọc đã lưu khi bảng bật preset */
export function buildFilterDrawerTabs(
  t: Translate,
  presetCount: number | undefined,
): V2TabItemData[] | undefined {
  if (presetCount === undefined) return undefined;
  return [
    { key: "columns", label: t("v2.table.filterTabColumns") },
    {
      key: "presets",
      label: t("v2.table.filterTabPresets"),
      badgeCount: presetCount,
    },
  ];
}
