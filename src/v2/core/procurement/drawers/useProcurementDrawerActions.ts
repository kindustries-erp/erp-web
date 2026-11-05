import * as React from "react";
import type {
  DrawerAction,
  V2DropdownEntry,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementRequestDetail } from "../procurement.types";

export interface UseProcurementDrawerActionsInput {
  viewing: boolean;
  canUpdate: boolean;
  availableActions: ProcurementActionKey[];
  detail?: ProcurementRequestDetail;
  saving: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onTransition?: (action: ProcurementActionKey, row?: any) => void;
}

/** Hook quản lý thanh nút và menu thao tác của Drawer đề nghị mua. */
export function useProcurementDrawerActions(
  input: UseProcurementDrawerActionsInput,
) {
  const { t } = useV2Translation();
  const {
    viewing,
    canUpdate,
    availableActions,
    detail,
    saving,
    loading,
    onClose,
    onSubmit,
    onTransition,
  } = input;

  const actionDropdownItems: V2DropdownEntry[] = React.useMemo(() => {
    if (!viewing || !canUpdate || !onTransition) return [];
    return availableActions.map((action) => ({
      id: action,
      label: t(`v2.procurement.actions.${action}`, action),
      onClick: () => onTransition(action, detail),
      danger: action === "cancel" || action === "reject",
    }));
  }, [viewing, canUpdate, onTransition, availableActions, detail, t]);

  const actions: DrawerAction[] = React.useMemo(() => {
    if (viewing) {
      const list: DrawerAction[] = [
        {
          label: t("v2.common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ];
      if (canUpdate && onTransition) {
        if (availableActions.includes("approve")) {
          list.unshift({
            label: t("v2.procurement.actions.approve", "Duyệt"),
            onClick: () => onTransition("approve", detail),
            primary: true,
          });
        } else if (availableActions.includes("submit")) {
          list.unshift({
            label: t("v2.procurement.actions.submit", "Gửi duyệt"),
            onClick: () => onTransition("submit", detail),
            primary: true,
          });
        }
      }
      return list;
    }
    return [
      {
        label: t("v2.common.cancel", "Hủy"),
        onClick: onClose,
        variant: "outline",
        disabled: saving,
      },
      {
        label: t("v2.common.save", "Lưu"),
        onClick: onSubmit,
        primary: true,
        loading: saving,
        disabled: saving || loading,
      },
    ];
  }, [
    viewing,
    onClose,
    canUpdate,
    onTransition,
    availableActions,
    detail,
    saving,
    onSubmit,
    loading,
    t,
  ]);

  return { actions, actionDropdownItems };
}
