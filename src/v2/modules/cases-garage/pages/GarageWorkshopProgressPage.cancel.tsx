import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";

export interface GarageWorkshopCancelConfirmProps {
  target: CaseWorkshopBoardItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Hộp xác nhận trước khi chuyển xe sang Hủy (từ drawer hoặc kéo thẻ). */
export function GarageWorkshopCancelConfirm({
  target,
  onConfirm,
  onCancel,
}: GarageWorkshopCancelConfirmProps) {
  const { t } = useV2Translation();
  const plate = target?.licensePlate || target?.caseCode || "";
  return (
    <V2ConfirmModal
      open={Boolean(target)}
      variant="danger"
      title={t("v2.garageCases.workshop.cancelCase.title", {
        defaultValue: "Hủy xe {{plate}}?",
        plate,
      })}
      message={t(
        "v2.garageCases.workshop.cancelCase.message",
        "Xe chuyển sang Hủy, công đoạn đang mở sẽ được đóng.",
      )}
      confirmLabel={t("v2.garageCases.workshop.cancelCase.confirm", "Hủy xe")}
      cancelLabel={t("v2.garageCases.workshop.cancelCase.back", "Quay lại")}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onOpenChange={(next) => !next && onCancel()}
      // Mở trên drawer V2: cùng quy ước z-index các drawer khác.
      className="z-[700]"
      overlayClassName="z-[699]"
    />
  );
}
