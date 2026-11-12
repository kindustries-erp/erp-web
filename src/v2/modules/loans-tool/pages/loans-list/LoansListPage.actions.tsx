import React from "react";
import { CreditCard, Eye, Pencil } from "lucide-react";
import { LoanItem, LoanStatus } from "@/v2/core/loans";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

interface BuildLoanRowActionsParams {
  t: Translate;
  onRecordPayment: (loan: LoanItem) => void;
  onViewDetail: (id: string) => void;
  onEdit: (loan: LoanItem) => void;
}

export function buildLoanRowActions({
  t,
  onRecordPayment,
  onViewDetail,
  onEdit,
}: BuildLoanRowActionsParams) {
  return (row: LoanItem): V2RowActionGroup[] => [
    {
      items: [
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
        {
          label: t("v2.common.viewDetail", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => onViewDetail(row.id),
        },
        {
          label: t("v2.common.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => onEdit(row),
        },
      ],
    },
  ];
}
