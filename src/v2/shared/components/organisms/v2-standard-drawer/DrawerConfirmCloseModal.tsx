import React from "react";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

interface DrawerConfirmCloseModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DrawerConfirmCloseModal: React.FC<
  DrawerConfirmCloseModalProps
> = ({ open, onConfirm, onCancel }) => {
  const { t } = useV2Translation();
  return (
    <V2ConfirmModal
      open={open}
      onOpenChange={(v) => !v && onCancel()}
      title={t("v2.drawer.closeConfirmTitle", "Xác nhận đóng biểu mẫu")}
      message={t(
        "v2.drawer.closeConfirmDesc",
        "Biểu mẫu đang ở chế độ chỉnh sửa. Bạn có chắc chắn muốn đóng và hủy các thay đổi chưa lưu?",
      )}
      confirmLabel={t("v2.drawer.closeWithoutSaving", "Đóng không lưu")}
      cancelLabel={t("v2.drawer.continueEdit", "Tiếp tục chỉnh sửa")}
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
