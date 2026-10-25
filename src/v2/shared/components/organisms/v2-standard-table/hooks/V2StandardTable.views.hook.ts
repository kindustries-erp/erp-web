import * as React from "react";
import type {
  V2FilterGroup,
  V2ViewModeItem,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type {
  V2TableToolbarConfig,
  V2ViewPreset,
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
import { useV2ViewDialogState } from "./V2StandardTable.views.dialog.hook";
import { useV2ViewPresetSync } from "./V2StandardTable.views.sync.hook";

export interface V2ViewSubmitInput {
  name: string;
  visibleKeys: string[];
}

export interface UseV2ViewPresetsOptions {
  tableId: string;
  viewModes?: V2TableToolbarConfig["viewModes"];
  filterGroup?: V2FilterGroup;
  /** Bỏ trống ở mobile (không có tùy chỉnh cột): hook vẫn nhớ filter group */
  prefs?: Pick<V2ColumnPreferencesApi, "orderedKeys" | "applyView">;
  storage?: V2ViewPresetStorage;
}

/** Trạng thái chế độ xem của bảng: view hệ thống (từ consumer) + view tùy chỉnh (lưu qua storage) */
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

  const selectView = (key: string) => {
    const custom = state.customViews.find((v) => v.key === key);
    setState((s) => ({ ...s, activeKey: key }));
    if (!viewModes) return;
    if (custom) {
      prefs?.applyView(custom);
      viewModes.onSelect(custom.baseKey);
      return;
    }
    viewModes.onSelect(key);
  };

  const openEdit = (key: string) => {
    const view = state.customViews.find((v) => v.key === key);
    if (view) setDialog({ mode: "edit", view });
  };

  const submitDialog = ({ name, visibleKeys }: V2ViewSubmitInput) => {
    if (!dialog) return;
    const visibility = Object.fromEntries(
      orderedKeys.map((key) => [key, visibleKeys.includes(key)]),
    );
    const order = [...orderedKeys];
    if (dialog.mode === "edit") {
      const edited: V2ViewPreset = {
        ...dialog.view,
        label: name,
        visibility,
        order,
      };
      setState((s) => ({
        ...s,
        customViews: s.customViews.map((v) =>
          v.key === edited.key ? edited : v,
        ),
      }));
      if (activeKey === edited.key) prefs?.applyView(edited);
    } else {
      const view: V2ViewPreset = {
        key: `custom_${Date.now()}`,
        label: name,
        baseKey,
        visibility,
        order,
      };
      setState((s) => ({
        ...s,
        customViews: [...s.customViews, view],
        activeKey: view.key,
      }));
      prefs?.applyView(view);
      if (baseKey !== pageKey) viewModes?.onSelect(baseKey);
    }
    setDialog(null);
  };

  const confirmDelete = () => {
    const key = pendingDeleteKey;
    clearDelete();
    if (!key) return;
    const fallback = systemItems[0]?.key;
    const wasActive = activeKey === key;
    setState((s) => ({
      ...s,
      customViews: s.customViews.filter((v) => v.key !== key),
      activeKey: wasActive ? fallback : s.activeKey,
    }));
    if (wasActive && fallback !== undefined) viewModes?.onSelect(fallback);
  };

  return {
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

export type V2ViewPresetsApi = ReturnType<typeof useV2ViewPresets>;
