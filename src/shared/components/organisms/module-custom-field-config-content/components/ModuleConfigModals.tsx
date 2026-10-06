import React from "react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { useModuleConfigContentState } from "../hooks/useModuleConfigContentState";

export interface ModuleConfigModalsProps {
  state: ReturnType<typeof useModuleConfigContentState>;
  onSelectModule: (moduleKey: string) => void;
  t: (key: string, fallback: string) => string;
}

export function ModuleConfigModals({
  state,
  onSelectModule,
  t,
}: ModuleConfigModalsProps) {
  return (
    <>
      <ConfirmModal
        open={state.deleteAttrTarget !== null}
        title={t("moduleConfig.confirmDeleteTitle", "Xóa thuộc tính")}
        message={t(
          "moduleConfig.confirmDeleteDesc",
          "Bạn có chắc chắn muốn xóa thuộc tính này? Thao tác này không thể hoàn tác.",
        )}
        confirmLabel={t("common.delete", "Xóa")}
        danger
        onConfirm={() => {
          if (state.deleteAttrTarget) {
            state.deleteAttrMutation.mutate(state.deleteAttrTarget.id);
          }
        }}
        onCancel={() => state.setDeleteAttrTarget(null)}
      />

      <ConfirmModal
        open={state.cancelConfirmTarget !== null}
        title={t("common.confirmCancelTitle", "Xác nhận hủy thay đổi")}
        message={t(
          "common.confirmCancelDesc",
          "Bạn có thay đổi chưa được lưu. Nếu hủy bây giờ, các thay đổi sẽ bị mất.",
        )}
        confirmLabel={t("common.discardChanges", "Hủy thay đổi")}
        cancelLabel={t("common.continueEditing", "Tiếp tục sửa")}
        danger
        onConfirm={() => {
          if (state.cancelConfirmTarget === "attr") {
            state.closeAttrForm();
          } else if (
            state.cancelConfirmTarget &&
            state.cancelConfirmTarget.type === "module"
          ) {
            state.closeAttrForm();
            onSelectModule(state.cancelConfirmTarget.nextKey);
          }
          state.setCancelConfirmTarget(null);
        }}
        onCancel={() => state.setCancelConfirmTarget(null)}
      />
    </>
  );
}
