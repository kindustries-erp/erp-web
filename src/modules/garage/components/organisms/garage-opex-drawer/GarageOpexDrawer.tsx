import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { OpexRecurringConfirmModal } from "../../OpexRecurringConfirmModal";
import type { GarageOpexDrawerProps } from "./garage-opex-drawer.type";
import { useGarageOpexDrawer } from "./garage-opex-drawer.hook";
import { GarageOpexDrawerForm } from "./GarageOpexDrawerForm";

export function GarageOpexDrawer(props: GarageOpexDrawerProps) {
  const { open, onClose, mode, setMode, isCreate = false, initialData } = props;

  const form = useGarageOpexDrawer(props);
  const {
    loading,
    isReadOnlyRecord,
    handleSave,
    handleConfirmRecurringScope,
    showConfirmModal,
    setShowConfirmModal,
    periodMonth,
    periodYear,
    untilMonth,
    untilYear,
    amount,
    categoryName,
    t,
  } = form;

  const isView = mode === "view" && !isCreate;
  const isEditing = mode === "edit" || isCreate;
  const isDuplicate = isCreate && Boolean(initialData);

  const drawerTitle = isDuplicate
    ? t("opex.drawer.duplicateTitle", "Nhân đôi chi phí vận hành")
    : isCreate
      ? t("opex.drawer.createTitle", "Thêm chi phí vận hành")
      : isView
        ? t("opex.drawer.viewTitle", "Chi tiết chi phí vận hành")
        : t("opex.drawer.editTitle", "Chỉnh sửa chi phí vận hành");

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        onClose={onClose}
        onToggleEdit={
          !isCreate && isView && !isReadOnlyRecord
            ? () => setMode("edit")
            : undefined
        }
        title={drawerTitle}
        layout="1-column"
        size="md"
        confirmOnClose={isEditing}
        actions={
          isEditing && !isReadOnlyRecord
            ? [
                {
                  label: t("opex.drawer.cancel", "Hủy"),
                  onClick: onClose,
                  disabled: loading,
                },
                {
                  label: loading
                    ? t("common.saving", "Đang lưu...")
                    : isCreate
                      ? t("opex.drawer.create", "Tạo chi phí")
                      : t("opex.drawer.save", "Lưu thay đổi"),
                  primary: true,
                  onClick: handleSave,
                  loading,
                  disabled: loading,
                },
              ]
            : [
                {
                  label: t("common.close", "Đóng"),
                  onClick: onClose,
                },
              ]
        }
        leftPanel={<GarageOpexDrawerForm form={form} isView={isView} />}
      />

      <OpexRecurringConfirmModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRecurringScope}
        loading={loading}
        currentPeriod={{ month: periodMonth, year: periodYear }}
        untilPeriod={{ month: untilMonth, year: untilYear }}
        amount={Number(amount.replace(/[^0-9.-]+/g, "")) || 0}
        categoryName={categoryName}
      />
    </>
  );
}
