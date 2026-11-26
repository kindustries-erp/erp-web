import * as React from "react";
import type { WorkshopCaseStatus } from "@/v2/core/cases-garage";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";

/**
 * Đổi trạng thái xe từ drawer hoặc kéo thẻ: Hủy phải xác nhận trước; trạng thái sai bảng chuyển
 * (xe ERP) báo lỗi ngay, không gọi API.
 */
export function useWorkshopStatusChange(
  move: (item: CaseWorkshopBoardItem, status: WorkshopCaseStatus) => void,
) {
  const { t } = useV2Translation();
  const [cancelTarget, setCancelTarget] =
    React.useState<CaseWorkshopBoardItem | null>(null);

  const request = (item: CaseWorkshopBoardItem, status: WorkshopCaseStatus) => {
    if (status === "CANCELLED") setCancelTarget(item);
    else move(item, status);
  };

  const invalid = (item: CaseWorkshopBoardItem, status: WorkshopCaseStatus) => {
    const from = t(
      `v2.garageCases.workshop.status.${item.status}`,
      item.status,
    );
    const to = t(`v2.garageCases.workshop.status.${status}`, status);
    useV2ToastStore.getState().showToast({
      title: t("v2.garageCases.workshop.error.invalidMove", {
        defaultValue: "Không chuyển được từ {{from}} sang {{to}}",
        from,
        to,
      }),
      variant: "destructive",
    });
  };

  return {
    request,
    invalid,
    cancelTarget,
    confirmCancel: () => {
      if (cancelTarget) move(cancelTarget, "CANCELLED");
      setCancelTarget(null);
    },
    dismissCancel: () => setCancelTarget(null),
  };
}
