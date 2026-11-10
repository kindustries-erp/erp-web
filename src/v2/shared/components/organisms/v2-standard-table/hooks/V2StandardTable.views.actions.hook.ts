import type * as React from "react";
import type {
  V2FilterGroup,
  V2ViewModeItem,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type {
  V2TableToolbarConfig,
  V2ViewPresetState,
} from "../toolbar/V2StandardTable.toolbar.type";
import {
  buildEditedView,
  buildNewView,
  buildViewVisibility,
} from "../utils/v2ViewPresetBuild";
import type { V2ColumnPreferencesApi } from "./V2StandardTable.preferences.hook";
import type { useV2ViewDialogState } from "./V2StandardTable.views.dialog.hook";

export interface V2ViewSubmitInput {
  name: string;
  visibleKeys: string[];
  /** Bộ lọc có sẵn gắn với view. Bỏ trống: tạo lấy bộ lọc đang chọn, sửa giữ nguyên */
  filterKey?: string;
}

type DialogState = ReturnType<typeof useV2ViewDialogState>;

export interface V2ViewActionsContext {
  state: V2ViewPresetState;
  setState: React.Dispatch<React.SetStateAction<V2ViewPresetState>>;
  dialog: DialogState["dialog"];
  setDialog: DialogState["setDialog"];
  pendingDeleteKey: DialogState["pendingDeleteKey"];
  clearDelete: DialogState["clearDelete"];
  systemItems: V2ViewModeItem[];
  activeKey: string;
  baseKey: string;
  pageKey?: string;
  orderedKeys: string[];
  prefs?: Pick<V2ColumnPreferencesApi, "applyView">;
  viewModes?: V2TableToolbarConfig["viewModes"];
  filterGroup?: V2FilterGroup;
}

/**
 * Hành động trên chế độ xem (chọn, sửa, lưu hộp thoại, xóa). Hàm thường, không gọi hook:
 * được `useV2ViewPresets` tạo lại mỗi lần render từ state hiện tại.
 */
export function createV2ViewActions(ctx: V2ViewActionsContext) {
  const {
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
  } = ctx;

  /** Đổi bộ lọc có sẵn theo view; bỏ qua khi view không có filterKey hoặc key không còn trong nhóm */
  const applyViewFilter = (filterKey?: string) => {
    if (!filterGroup || filterKey === undefined) return;
    if (filterKey === filterGroup.activeKey) return;
    if (!filterGroup.items.some((item) => item.key === filterKey)) return;
    filterGroup.onChange(filterKey);
  };

  const selectView = (key: string) => {
    const custom = state.customViews.find((v) => v.key === key);
    setState((s) => ({ ...s, activeKey: key }));
    if (!viewModes) return;
    if (custom) {
      prefs?.applyView(custom);
      applyViewFilter(custom.filterKey);
      viewModes.onSelect(custom.baseKey);
      return;
    }
    viewModes.onSelect(key);
  };

  const openEdit = (key: string) => {
    const view = state.customViews.find((v) => v.key === key);
    if (view) setDialog({ mode: "edit", view });
  };

  const submitDialog = (input: V2ViewSubmitInput) => {
    if (!dialog) return;
    const visibility = buildViewVisibility(orderedKeys, input.visibleKeys);
    const order = [...orderedKeys];
    if (dialog.mode === "edit") {
      const edited = buildEditedView(dialog.view, {
        name: input.name,
        visibility,
        order,
        filterKey: input.filterKey,
      });
      setState((s) => ({
        ...s,
        customViews: s.customViews.map((v) =>
          v.key === edited.key ? edited : v,
        ),
      }));
      if (activeKey === edited.key) prefs?.applyView(edited);
    } else {
      const view = buildNewView(baseKey, {
        name: input.name,
        visibility,
        order,
        filterKey: input.filterKey ?? filterGroup?.activeKey,
      });
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

  return { selectView, openEdit, submitDialog, confirmDelete };
}
