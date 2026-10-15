import React from "react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { Eye, Pencil, Scale, Receipt, RefreshCw, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export interface CaseActionCallbacks {
  onOpenCaseDetail: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal: (c: any) => void;
  onOpenInvoiceLinkingModal: (c: any) => void;
  onSyncFromKgara?: (caseId: string) => void;
}

export function buildCustomerCaseRowActions(
  row: any,
  callbacks: CaseActionCallbacks,
  t: (key: string, fallback: string) => string,
  debtType?: "receivables" | "payables",
): ActionDropdownItem[] {
  const caseCode = row.soChungTu || row.id;

  const handleCopy = () => {
    if (!caseCode) return;
    void navigator.clipboard.writeText(caseCode);
    toast.success(t("common:copied", "Đã sao chép vào bộ nhớ tạm"));
  };

  return [
    {
      groupLabel: t("common:view", "Xem & Tra cứu"),
      items: [
        {
          label: t("customers.actions.viewCase", "Xem chi tiết vụ việc"),
          icon: <Eye className="w-4 h-4 text-primary" />,
          onClick: () => callbacks.onOpenCaseDetail(caseCode, false),
        },
        {
          label: t("customers.actions.editCase", "Chỉnh sửa vụ việc..."),
          icon: (
            <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ),
          onClick: () => callbacks.onOpenCaseDetail(caseCode, true),
        },
        {
          label:
            debtType === "payables"
              ? t(
                  "payables.actions.settlePayable",
                  "Cấn trừ chi phí / Phiếu chi...",
                )
              : t("customers.actions.settlement", "Cấn trừ phiếu thu..."),
          icon: (
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ),
          onClick: () => callbacks.onOpenSettlementModal(row),
        },
        {
          label: t("customers.actions.linkInvoice", "Ghép nối hóa đơn VAT..."),
          icon: (
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ),
          onClick: () => callbacks.onOpenInvoiceLinkingModal(row),
        },
      ],
    },
    {
      groupLabel: t("common:utility", "Tiện ích"),
      items: [
        ...(callbacks.onSyncFromKgara && row.id
          ? [
              {
                label: t("customers.actions.syncKgara", "Đồng bộ lại từ KGara"),
                icon: <RefreshCw className="w-4 h-4 text-muted-foreground" />,
                onClick: () => callbacks.onSyncFromKgara?.(row.id),
              },
            ]
          : []),
        {
          label: t("common:copyCode", "Sao chép mã chứng từ"),
          icon: <Copy className="w-4 h-4 text-muted-foreground" />,
          onClick: handleCopy,
        },
      ],
    },
  ];
}
