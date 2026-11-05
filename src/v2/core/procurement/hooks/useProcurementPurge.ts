import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  showProcurementError,
  showProcurementSuccess,
} from "../procurement.toast";
import type { ProcurementListConfig } from "./procurementListConfig.type";

/**
 * Xóa cứng đơn nháp (quyền `purge`). Tách khỏi useProcurementList để giữ kích thước file.
 * Backend chặn khi còn chứng từ phụ thuộc; lỗi đó hiện qua toast.
 */
export function useProcurementPurge<T extends { id: string }>(
  config: ProcurementListConfig<T>,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const hasPurgePermission = useV2HasPermission({
    collection: config.permissionCollection,
    action: "purge",
  });
  const [purgeTarget, setPurgeTarget] = React.useState<T | null>(null);

  const purge = useMutation({
    mutationFn: (id: string) => {
      if (!config.api.purge) throw new Error("purge not supported");
      return config.api.purge(id);
    },
    onSuccess: () => {
      showProcurementSuccess(
        t("v2.procurement.purgeDone", "Đã xóa vĩnh viễn đơn nháp"),
      );
      setPurgeTarget(null);
      void queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.actionError", "Không thực hiện được thao tác"),
      ),
  });

  const canPurge = hasPurgePermission && Boolean(config.api.purge);

  /** Nút xóa vĩnh viễn của một dòng: chỉ khi có quyền và dòng còn nháp. */
  const purgeActions = (row: T) =>
    canPurge && config.isEditable(row)
      ? [
          {
            label: t("v2.procurement.actions.purge", "Xóa vĩnh viễn"),
            onClick: () => setPurgeTarget(row),
            variant: "danger" as const,
          },
        ]
      : [];

  return {
    canPurge,
    purgeActions,
    purgeTarget,
    closePurge: () => setPurgeTarget(null),
    confirmPurge: () => {
      if (purgeTarget) purge.mutate(purgeTarget.id);
    },
    isPurging: purge.isPending,
  };
}
