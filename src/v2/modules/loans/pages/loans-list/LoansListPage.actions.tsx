import React from "react";
import { CreditCard, Eye, Pencil, Trash2 } from "lucide-react";
import { LoanItem, LoanStatus } from "@/v2/core/loans";
import type { V2RowAction, V2RowActionGroup } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

interface BuildLoanRowActionsParams {
  t: Translate;
  isDeleted: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPurge: boolean;
  onRecordPayment: (loan: LoanItem) => void;
  onViewDetail: (id: string) => void;
  onEdit: (loan: LoanItem) => void;
  onDelete: (loan: LoanItem) => void;
  onPurge: (loan: LoanItem) => void;
}

export function buildLoanRowActions({
  t,
  isDeleted,
  canUpdate,
  canDelete,
  canPurge,
  onRecordPayment,
  onViewDetail,
  onEdit,
  onDelete,
  onPurge,
}: BuildLoanRowActionsParams) {
  return (row: LoanItem): V2RowActionGroup[] => {
    if (isDeleted) {
      if (!canPurge) return [];
      return [
        {
          groupLabel: t("v2.loans.actionGroups.operate", "Thao tác"),
          items: [
            {
              label: t("v2.loans.action.purgeLoan", "Xóa vĩnh viễn"),
              icon: <Trash2 className="h-3.5 w-3.5" />,
              variant: "danger",
              onClick: () => onPurge(row),
            },
          ],
        },
      ];
    }

    const operateItems: V2RowAction[] = [];
    if (canUpdate) {
      operateItems.push(
        {
          label: t("v2.common.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => onEdit(row),
        },
        {
          label: t("v2.loans.action.recordPayment", "Ghi nhận thanh toán"),
          icon: <CreditCard className="h-3.5 w-3.5" />,
          disabled:
            row.status === LoanStatus.COMPLETED ||
            Number(row.remainingPrincipal ?? row.principalAmount) <= 0,
          disabledReason: t(
            "v2.loans.status.alreadyCompleted",
            "Khoản vay đã tất toán",
          ),
          onClick: () => onRecordPayment(row),
        },
      );
    }

    if (canDelete) {
      operateItems.push({
        label: t("v2.loans.action.deleteLoan", "Xóa khoản vay"),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => onDelete(row),
      });
    }

    return [
      {
        groupLabel: t("v2.loans.actionGroups.lookup", "Tra cứu"),
        items: [
          {
            label: t("v2.common.viewDetail", "Xem chi tiết"),
            icon: <Eye className="h-3.5 w-3.5" />,
            onClick: () => onViewDetail(row.id),
          },
        ],
      },
      ...(operateItems.length > 0
        ? [
            {
              groupLabel: t("v2.loans.actionGroups.operate", "Thao tác"),
              items: operateItems,
            },
          ]
        : []),
    ];
  };
}
