import * as React from "react";
import type {
  V2FilterGroup,
  V2ViewModeItem,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type {
  V2FilterPreset,
  V2TableToolbarConfig,
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "../toolbar/V2StandardTable.toolbar.type";
import { v2ViewPresetStorage } from "@/v2/shared/preferences/v2TablePreferenceStorages";
import {
  buildViewItems,
  createEmptyViewPresetState,
  isViewNameTaken,
  resolveActiveViewKey,
} from "../utils/v2ViewPresets";
import type { V2ColumnPreferencesApi } from "./V2StandardTable.preferences.hook";
import type { V2FilterPresetsApi } from "./V2StandardTable.filterpresets.hook";
import { createV2ViewActions } from "./V2StandardTable.views.actions.hook";
import { useV2ViewDialogState } from "./V2StandardTable.views.dialog.hook";
import { useV2ViewPresetSync } from "./V2StandardTable.views.sync.hook";

export type { V2ViewSubmitInput } from "./V2StandardTable.views.actions.hook";

const EMPTY_FILTERS: V2FilterPreset[] = [];

export interface UseV2ViewPresetsOptions {
  tableId: string;
  viewModes?: V2TableToolbarConfig["viewModes"];
  filterGroup?: V2FilterGroup;
  /** Bỏ trống ở mobile (không có tùy chỉnh cột): hook vẫn nhớ filter group */
  prefs?: Pick<V2ColumnPreferencesApi, "orderedKeys" | "applyView">;
  storage?: V2ViewPresetStorage;
}

/** Trạng thái chế độ xem của bảng: view hệ thống (từ consumer) + view tùy chỉnh và bộ lọc tùy chỉnh (lưu qua storage) */
export function useV2ViewPresets({
  tableId,
  viewModes,
  filterGroup,
  prefs,
  storage = v2ViewPresetStorage,
}: UseV2ViewPresetsOptions) {
  const [state, setState] = React.useState<V2ViewPresetState>(
    () => storage.load(tableId) ?? createEmptyViewPresetState(),
  );

  const pageKey = viewModes?.activeKey;
  const orderedKeys = prefs?.orderedKeys ?? [];
  const systemItems = React.useMemo<V2ViewModeItem[]>(
    () => (viewModes?.items ?? []).map((item) => ({ ...item, isSystem: true })),
    [viewModes?.items],
  );
  const items = React.useMemo(
    () => buildViewItems(systemItems, state.customViews),
    [systemItems, state.customViews],
  );
  const activeKey = resolveActiveViewKey(state, items, pageKey);
  const activeCustom = state.customViews.find((v) => v.key === activeKey);
  const baseKey = activeCustom ? activeCustom.baseKey : activeKey;

  useV2ViewPresetSync({
    tableId,
    state,
    setState,
    storage,
    filterKey: filterGroup?.activeKey,
    pageKey,
  });

  const {
    dialog,
    setDialog,
    closeDialog,
    pendingDeleteKey,
    requestDelete,
    clearDelete,
    pendingDelete,
  } = useV2ViewDialogState(items);

  const { selectView, openEdit, submitDialog, confirmDelete } =
    createV2ViewActions({
      state,
      setState,
      dialog,
      setDialog,
      pendingDeleteKey,
      clearDelete,
      systemItems,
      activeKey,
      baseKey,
      pageKey,
      orderedKeys,
      prefs,
      viewModes,
      filterGroup,
    });

  /** Bộ lọc tùy chỉnh cùng state (cùng một lần lưu); cập nhật qua updater để không mất view */
  const customFilters = state.customFilters ?? EMPTY_FILTERS;
  const setCustomFilters = React.useCallback(
    (update: (current: V2FilterPreset[]) => V2FilterPreset[]) =>
      setState((s) => ({ ...s, customFilters: update(s.customFilters ?? []) })),
    [],
  );

  return {
    customFilters,
    setCustomFilters,
    viewModes: viewModes
      ? {
          items,
          activeKey,
          onSelect: selectView,
          onCreate: () => setDialog({ mode: "create" }),
          onEdit: openEdit,
          onDelete: requestDelete,
        }
      : undefined,
    filterGroup,
    dialog,
    closeDialog,
    submitDialog,
    isNameTaken: (name: string, exceptKey?: string) =>
      isViewNameTaken(items, name, exceptKey),
    pendingDelete,
    cancelDelete: clearDelete,
    confirmDelete,
  };
}

/** API chế độ xem; bản desktop gắn thêm bộ lọc tùy chỉnh (`filterPresets`) */
export type V2ViewPresetsApi = ReturnType<typeof useV2ViewPresets> & {
  filterPresets?: V2FilterPresetsApi;
};
