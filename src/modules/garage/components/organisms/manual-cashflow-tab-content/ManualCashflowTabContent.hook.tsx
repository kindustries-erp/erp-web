import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  TableDateCell,
  TableText,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { ManualCashflowTabContentProps } from "./ManualCashflowTabContent.type";

export function useManualCashflowTabContent(
  props: ManualCashflowTabContentProps,
) {
  const { activeSettlements = [], onRemoveSettlement, settlementType } = props;
  const { t } = useTranslation(["garage", "common"]);

  // Filter recorded manual settlements for current settlement direction (RECEIPT vs PAYMENT)
  const domainManualSettlements = useMemo(() => {
    return (activeSettlements || []).filter((s: any) => {
      const isReceipt =
        s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
      const targetType = settlementType === "RECEIPT";
      if (isReceipt !== targetType) return false;

      const isManual =
        (s.source_channel || s.sourceChannel) === "OFF_SYSTEM_MANUAL" ||
        s.category === "TIEN_MAT_NGOAI" ||
        s.category === "CHUYEN_KHOAN_CA_NHAN" ||
        s.category === "KHAC" ||
        (!s.bank_transaction_id && !s.bankTransactionId);

      return isManual;
    });
  }, [activeSettlements, settlementType]);

  const totalRecordedManualAmount = useMemo(() => {
    return domainManualSettlements.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0,
    );
  }, [domainManualSettlements]);

  // Standardized Table Columns following /standardize-table
  const columns: DataTableColumn<any>[] = useMemo(() => {
    return [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "transDate",
        header: t("cases.reconciliation.transDate", "Ngày phát sinh"),
        size: 130,
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <TableDateCell
            date={row.transDate || row.trans_date || row.createdAt}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "partnerName",
        header: t("cases.reconciliation.payerOrReceiver", "Người nộp / nhận"),
        size: 200,
        enableResizing: true,
        cell: (row) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            <TableText
              text={
                row.partnerName ||
                row.partner_name ||
                row.correspondentName ||
                "—"
              }
              tooltip={true}
              enableCopy={true}
            />
            {row.isPending && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 whitespace-nowrap">
                {t("cases.reconciliation.pendingBadge", "Chờ lưu")}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: t("cases.reconciliation.amount", "Số tiền (VNĐ)"),
        size: 150,
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "tabular-nums font-semibold",
              settlementType === "RECEIPT"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {money(Number(row.amount || 0))}
          </span>
        ),
      },
      {
        key: "note",
        header: t("cases.reconciliation.manualNote", "Ghi chú & Diễn giải"),
        size: 240,
        enableResizing: true,
        cell: (row) => <TableText text={row.note || "—"} tooltip={true} />,
      },
    ];
  }, [settlementType, t]);

  const summaryRow = useMemo(() => {
    if (domainManualSettlements.length === 0) return undefined;
    return {
      partnerName: (
        <div className="text-right w-full font-semibold">
          {t("cases.reconciliation.total", "Tổng cộng")}:
        </div>
      ),
      amount: (
        <div
          className={cn(
            "text-right font-bold tabular-nums",
            settlementType === "RECEIPT"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400",
          )}
        >
          {money(totalRecordedManualAmount)}
        </div>
      ),
    };
  }, [
    domainManualSettlements.length,
    settlementType,
    totalRecordedManualAmount,
    t,
  ]);

  // Floated Action Button chuẩn /standardize-table
  const getRowActions = useMemo(() => {
    if (!onRemoveSettlement) return undefined;
    return (row: any): ActionDropdownItem[] => [
      {
        groupLabel: "THAO TÁC",
        items: [
          {
            label: t("cases.actions.delete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
            variant: "danger",
            onClick: () => onRemoveSettlement(row.id || row.tempId),
          },
        ],
      },
    ];
  }, [onRemoveSettlement, t]);

  return {
    t,
    domainManualSettlements,
    totalRecordedManualAmount,
    columns,
    summaryRow,
    getRowActions,
  };
}
