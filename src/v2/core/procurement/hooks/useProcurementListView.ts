import * as React from "react";
import { useV2TablePreferencesStore } from "@/v2/shared/preferences/useV2TablePreferencesStore";
import { applyV2SystemView } from "@/v2/shared/preferences/v2TablePreferenceStorages";

/** Chế độ xem hệ thống của bảng procurement: "overview" (tổng quan) và "all" (tất cả cột). */
export const PROCUREMENT_VIEW_KEYS = {
  overview: "overview",
  all: "all",
} as const;

export type ProcurementViewVisibility = Record<string, Record<string, boolean>>;

/**
 * Chế độ xem của bảng procurement: đổi cột hiển thị theo view hệ thống.
 * `tableKey` tăng mỗi lần đổi view để bảng dựng lại với cột mới.
 */
export function useProcurementListView(
  tableId: string,
  visibilityByView: ProcurementViewVisibility,
) {
  const [view, setView] = React.useState<string>(
    () =>
      useV2TablePreferencesStore.getState().tables[tableId]?.views?.activeKey ??
      PROCUREMENT_VIEW_KEYS.overview,
  );
  const [tableKey, setTableKey] = React.useState(0);

  React.useEffect(() => {
    const overview = visibilityByView[PROCUREMENT_VIEW_KEYS.overview];
    if (
      !useV2TablePreferencesStore.getState().tables[tableId]?.columns &&
      overview
    ) {
      applyV2SystemView(tableId, PROCUREMENT_VIEW_KEYS.overview, overview);
    }
  }, [tableId, visibilityByView]);

  const selectView = React.useCallback(
    (key: string) => {
      setView(key);
      const visibility = visibilityByView[key];
      if (visibility) {
        applyV2SystemView(tableId, key, visibility);
        setTableKey((value) => value + 1);
      }
    },
    [tableId, visibilityByView],
  );

  return { view, selectView, tableKey };
}
