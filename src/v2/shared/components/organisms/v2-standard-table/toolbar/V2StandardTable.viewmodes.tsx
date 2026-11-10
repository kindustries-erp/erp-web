import * as React from "react";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import type { V2ColumnToggleItem } from "@/v2/shared/components/molecules/v2-column-toggle";
import {
  V2_FILTER_GROUP_ALL_KEY,
  V2ViewModeCombobox,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ViewPresetsApi } from "../hooks/V2StandardTable.views.hook";
import type { V2FilterPreset } from "./V2StandardTable.toolbar.type";
import { V2FilterPresetDialog } from "./V2StandardTable.filterdialog";
import { V2ViewConfigDialog } from "./V2StandardTable.viewdialog";

export interface V2TableViewModesProps {
  presets: V2ViewPresetsApi;
  columns: V2ColumnToggleItem[];
}

type FilterDialogState =
  | { mode: "create" }
  | { mode: "edit"; preset: V2FilterPreset }
  | null;

/** Chế độ xem + nhóm lọc (kèm bộ lọc tùy chỉnh), hộp thoại tạo/sửa và xác nhận xóa */
export const V2TableViewModes: React.FC<V2TableViewModesProps> = ({
  presets,
  columns,
}) => {
  const { t } = useV2Translation();
  const { viewModes, filterGroup, dialog, pendingDelete } = presets;
  const filters = presets.filterPresets;
  const [filterDialog, setFilterDialog] =
    React.useState<FilterDialogState>(null);
  const [pendingFilterKey, setPendingFilterKey] = React.useState<string | null>(
    null,
  );
  const editing = dialog?.mode === "edit" ? dialog.view : undefined;
  const visibleKeys = editing
    ? columns
        .filter((c) => editing.visibility[c.key] !== false)
        .map((c) => c.key)
    : columns.filter((c) => c.visible).map((c) => c.key);

  const customFilters = filters
    ? {
        items: filters.presets.map((p) => ({ key: p.key, label: p.label })),
        activeKey: filters.activeKey,
        canCreate: filters.canCreate,
        onSelect: filters.select,
        onClear: filters.clearActive,
        onCreate: () => setFilterDialog({ mode: "create" }),
        onEdit: (key: string) => {
          const preset = filters.presets.find((p) => p.key === key);
          if (preset) setFilterDialog({ mode: "edit", preset });
        },
        onDelete: setPendingFilterKey,
      }
    : undefined;
  const editingFilterKey =
    filterDialog?.mode === "edit" ? filterDialog.preset.key : undefined;
  const allKey = filterGroup?.allKey ?? V2_FILTER_GROUP_ALL_KEY;
  const groupOptions = filterGroup?.items ?? [];
  // Bộ lọc gốc của bộ lọc đang sửa nếu còn trong nhóm; tạo mới: nhóm đang chọn
  const presetGroupKey =
    filterDialog?.mode === "edit" ? filterDialog.preset.groupKey : undefined;
  const initialGroupKey =
    presetGroupKey !== undefined &&
    groupOptions.some((item) => item.key === presetGroupKey)
      ? presetGroupKey
      : (filters?.defaultGroupKey ?? allKey);

  return (
    <>
      <V2ViewModeCombobox
        items={viewModes?.items}
        activeKey={viewModes?.activeKey}
        onSelect={viewModes?.onSelect}
        onCreate={viewModes?.onCreate}
        onEdit={viewModes?.onEdit}
        onDelete={viewModes?.onDelete}
        filterGroup={filterGroup}
        customFilters={customFilters}
      />
      {dialog && (
        <V2ViewConfigDialog
          mode={dialog.mode}
          initialName={editing?.label ?? ""}
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            canHide: c.canHide !== false,
          }))}
          initialVisibleKeys={visibleKeys}
          filterOptions={filterGroup?.items}
          initialFilterKey={
            editing ? editing.filterKey : filterGroup?.activeKey
          }
          isNameTaken={(name) => presets.isNameTaken(name, editing?.key)}
          onSubmit={presets.submitDialog}
          onClose={presets.closeDialog}
        />
      )}
      {filters && filterDialog && (
        <V2FilterPresetDialog
          key={editingFilterKey ?? "create"}
          mode={filterDialog.mode}
          initialLabel={
            filterDialog.mode === "edit" ? filterDialog.preset.label : ""
          }
          initialGroupKey={initialGroupKey}
          initialQuery={
            filterDialog.mode === "edit" ? filterDialog.preset.query : undefined
          }
          groupOptions={groupOptions}
          source={filters.editorSource}
          isNameTaken={(name) => filters.isNameTaken(name, editingFilterKey)}
          onSubmit={(draft) => {
            if (filterDialog.mode === "create") filters.create(draft);
            else filters.update(filterDialog.preset.key, draft);
            setFilterDialog(null);
          }}
          onClose={() => setFilterDialog(null)}
        />
      )}
      <V2ConfirmModal
        open={pendingFilterKey !== null}
        onOpenChange={(open) => !open && setPendingFilterKey(null)}
        title={t("v2.table.filterPresetDeleteTitle", "Xóa bộ lọc")}
        message={t(
          "v2.table.filterPresetDeleteConfirm",
          "Bạn chắc chắn muốn xóa bộ lọc này?",
        )}
        confirmLabel={t("v2.table.deleteFilterPreset", "Xóa bộ lọc")}
        variant="danger"
        onConfirm={() => {
          if (pendingFilterKey !== null) filters?.remove(pendingFilterKey);
          setPendingFilterKey(null);
        }}
        onCancel={() => setPendingFilterKey(null)}
      />
      <V2ConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && presets.cancelDelete()}
        title={t("v2.table.viewDeleteTitle", "Xóa chế độ xem")}
        message={t(
          "v2.table.viewDeleteConfirm",
          "Bạn chắc chắn muốn xóa chế độ xem này?",
        )}
        confirmLabel={t("v2.table.deleteView", "Xóa chế độ xem")}
        variant="danger"
        onConfirm={presets.confirmDelete}
        onCancel={presets.cancelDelete}
      />
    </>
  );
};
