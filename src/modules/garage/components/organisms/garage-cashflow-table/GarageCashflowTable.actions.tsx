import React from "react";
import { Edit2, Trash2, FileText } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { GarageCashflowItem } from "@/modules/garage/api/garageCashflowApi";
import type { ColumnContext } from "./GarageCashflowTable.type";

export function buildCashflowRowActions(
  ctx: ColumnContext,
): (item: GarageCashflowItem) => ActionDropdownItem[] {
  const { t, onOpenCase, onEdit, onDelete } = ctx;

  return (item: GarageCashflowItem): ActionDropdownItem[] => {
    const actions: ActionDropdownItem[] = [];

    if (item.caseId && item.caseCode && onOpenCase) {
      actions.push({
        label: t("cases.cashflow.viewCase", "Xem phiếu dịch vụ"),
        icon: <FileText className="w-3.5 h-3.5 text-primary" />,
        onClick: () => onOpenCase(item.caseId!, item.caseCode!),
      });
    }

    if (onEdit) {
      actions.push({
        label: t("common.actions.edit", "Chỉnh sửa"),
        icon: <Edit2 className="w-3.5 h-3.5" />,
        onClick: () => onEdit(item),
      });
    }

    if (onDelete) {
      actions.push({
        label: t("common.actions.delete", "Xóa"),
        icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
        variant: "danger",
        onClick: () => onDelete(item),
      });
    }

    return actions;
  };
}
