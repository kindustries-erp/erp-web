import { useUserPreferencesStore } from "@/shared/hooks/useUserPreferences";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";
import type { V2ColumnPreferencesStorage } from "@/v2/shared/components/organisms/v2-standard-table";
import type {
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "@/v2/shared/components/organisms/v2-standard-table/toolbar/V2StandardTable.toolbar.type";

const current = (tableId: string) =>
  useUserPreferencesStore.getState().getTablePreference(tableId);

export const legacyPartnerColumnStorage: V2ColumnPreferencesStorage = {
  load: (tableId) => {
    const saved = current(tableId);
    return saved
      ? {
          visibility: saved.columnVisibility ?? {},
          order: saved.columnOrder ?? [],
          sizing: saved.columnSizing ?? {},
        }
      : null;
  },
  save: (tableId, preferences) => {
    const saved = current(tableId);
    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      columnOrder: preferences.order,
      columnVisibility: preferences.visibility,
      columnSizing: preferences.sizing,
      views: saved?.views,
      activeView: saved?.activeView,
    });
  },
  clear: (tableId) => {
    const saved = current(tableId);
    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      columnOrder: [],
      columnVisibility: {},
      views: saved?.views,
      activeView: saved?.activeView,
    });
  },
};

const toV2View = (view: TableViewPreset, order: string[]) => ({
  key: view.key,
  label: view.label,
  baseKey: "overview",
  visibility: view.columnVisibility ?? {},
  order,
});

export const legacyPartnerViewStorage: V2ViewPresetStorage = {
  load: (tableId): V2ViewPresetState | null => {
    const saved = current(tableId);
    if (!saved) return null;
    return {
      customViews: (saved.views ?? [])
        .filter((view) => view.isCustom)
        .map((view) => toV2View(view, saved.columnOrder ?? [])),
      activeKey: saved.activeView,
    };
  },
  save: (tableId, state) => {
    const saved = current(tableId) ?? { columnOrder: [], columnVisibility: {} };
    const views: TableViewPreset[] = state.customViews.map((view) => ({
      key: view.key,
      label: view.label,
      filters: {},
      columnVisibility: view.visibility,
      isCustom: true,
    }));
    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      ...saved,
      views,
      activeView: state.activeKey,
    });
  },
  clear: (tableId) => {
    const saved = current(tableId);
    if (!saved) return;
    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      ...saved,
      views: [],
      activeView: undefined,
    });
  },
};

export const applyLegacySystemView = (
  tableId: string,
  key: string,
  visibility: Record<string, boolean>,
) => {
  const saved = current(tableId) ?? { columnOrder: [], columnVisibility: {} };
  useUserPreferencesStore.getState().setTablePreferences(tableId, {
    ...saved,
    columnVisibility: visibility,
    activeView: key,
  });
};
