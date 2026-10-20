import * as React from "react";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import type { V2ColumnToggleItem } from "@/v2/shared/components/molecules/v2-column-toggle";
import { V2ViewModeCombobox } from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ViewPresetsApi } from "../hooks/V2StandardTable.views.hook";
import { V2ViewConfigDialog } from "./V2StandardTable.viewdialog";

export interface V2TableViewModesProps {
  presets: V2ViewPresetsApi;
  columns: V2ColumnToggleItem[];
}

/** Chế độ xem + nhóm lọc, kèm hộp thoại tạo/sửa và xác nhận xóa của chế độ xem tùy chỉnh */
export const V2TableViewModes: React.FC<V2TableViewModesProps> = ({
  presets,
  columns,
}) => {
  const { t } = useV2Translation();
  const { viewModes, filterGroup, dialog, pendingDelete } = presets;
  const editing = dialog?.mode === "edit" ? dialog.view : undefined;
  const visibleKeys = editing
    ? columns
        .filter((c) => editing.visibility[c.key] !== false)
        .map((c) => c.key)
    : columns.filter((c) => c.visible).map((c) => c.key);

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
          isNameTaken={(name) => presets.isNameTaken(name, editing?.key)}
          onSubmit={presets.submitDialog}
          onClose={presets.closeDialog}
        />
      )}
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
