import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementActionKey } from "../procurement.rules";
import {
  showProcurementError,
  showProcurementSuccess,
} from "../procurement.toast";
import type { ProcurementListConfig } from "./procurementListConfig.type";

export interface ProcurementTransitionCallbacks {
  /** Sau khi chuyển trạng thái thành công: đóng modal lý do/xác nhận */
  onTransitioned: () => void;
  /** Sau khi xóa nháp thành công: đóng modal xóa */
  onRemoved: () => void;
}

/** Mutation chuyển trạng thái và xóa nháp của màn danh sách: toast, làm mới cache. */
export function useProcurementTransition<T extends { id: string }>(
  config: ProcurementListConfig<T>,
  callbacks: ProcurementTransitionCallbacks,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();

  const transition = useMutation({
    mutationFn: (vars: {
      id: string;
      action: ProcurementActionKey;
      reason?: string;
      approverId?: string | null;
    }) =>
      config.api.transition(vars.id, vars.action, vars.reason, vars.approverId),
    onSuccess: () => {
      showProcurementSuccess(
        t("v2.procurement.actionDone", "Đã cập nhật chứng từ"),
      );
      callbacks.onTransitioned();
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.actionError", "Không thực hiện được thao tác"),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string) => {
      if (!config.api.remove) throw new Error("remove not supported");
      return config.api.remove(id);
    },
    onSuccess: () => {
      showProcurementSuccess(t("v2.procurement.deleteDone", "Đã xóa đơn nháp"));
      callbacks.onRemoved();
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.actionError", "Không thực hiện được thao tác"),
      ),
  });

  return { transition, remove };
}
