import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2RowAction, V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";

export interface ProcurementRowActionsInput<T extends { id: string }> {
  config: ProcurementListConfig<T>;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  /** Mở drawer của một chứng từ ở chế độ xem hoặc sửa */
  openDrawer: (id: string, mode: "view" | "edit") => void;
  /** Mở modal lý do hoặc xác nhận cho một hành động chuyển trạng thái */
  start: (row: T, action: ProcurementActionKey) => void;
  /** Mở modal xóa nháp */
  openDelete: (row: T) => void;
  /** Chuyển sang lập PO từ PR */
  orderFromRequest: (row: T) => void;
  /** Hành động xóa vĩnh viễn của hook purge */
  purgeActions: (row: T) => V2RowAction[];
}

/** Dựng nhóm thao tác theo dòng: xem, sửa, tạo PO, chuyển trạng thái, xóa. */
export function useProcurementRowActions<T extends { id: string }>({
  config,
  canCreate,
  canUpdate,
  canDelete,
  openDrawer,
  start,
  openDelete,
  orderFromRequest,
  purgeActions,
}: ProcurementRowActionsInput<T>) {
  const { t } = useV2Translation();

  return React.useCallback(
    (row: T): V2RowActionGroup[] => {
      const view = {
        label: t("v2.procurement.actions.view", "Xem"),
        onClick: () => openDrawer(row.id, "view"),
      };
      const edit =
        canUpdate && config.isEditable(row)
          ? [
              {
                label: t("v2.procurement.actions.edit", "Sửa"),
                onClick: () => openDrawer(row.id, "edit"),
              },
            ]
          : [];
      const transitions = canUpdate
        ? config.availableActions(row).map((action) => ({
            label: t(`v2.procurement.actions.${action}`, action),
            onClick: () => start(row, action),
            variant:
              action === "cancel" || action === "reject"
                ? ("danger" as const)
                : ("default" as const),
          }))
        : [];
      const fromRequest =
        canCreate && config.poHref && config.canOrderFromRequest?.(row)
          ? [
              {
                label: t("v2.procurement.actions.createOrder", "Tạo PO từ PR"),
                onClick: () => orderFromRequest(row),
              },
            ]
          : [];
      const deletable =
        canDelete && config.api.remove && config.isEditable(row)
          ? [
              {
                label: t("v2.procurement.actions.delete", "Xóa"),
                onClick: () => openDelete(row),
                variant: "danger" as const,
              },
            ]
          : [];
      const purgeable = purgeActions(row);
      return [
        { items: [view, ...edit, ...fromRequest] },
        ...(transitions.length ? [{ items: transitions }] : []),
        ...(deletable.length || purgeable.length
          ? [{ items: [...deletable, ...purgeable] }]
          : []),
      ];
    },
    [
      canCreate,
      canDelete,
      canUpdate,
      config,
      openDelete,
      openDrawer,
      orderFromRequest,
      purgeActions,
      start,
      t,
    ],
  );
}
