import React, { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Eye, Trash2 } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { NetOffInput } from "./NetOffInput";
import type { SelectedBankTransactionsTableProps } from "../types";

export function SelectedBankTransactionsTable({
  items,
  netOffAmounts,
  maxAmounts,
  onAmountChange,
  onRemove,
  onViewDetail,
}: SelectedBankTransactionsTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx + 1}
          </span>
        ),
      },
      {
        key: "transDate",
        header: t("cases.reconciliation.date", "Ngày GD"),
        size: 95,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row) =>
          row.transDate ? format(new Date(row.transDate), "dd/MM/yyyy") : "—",
      },
      {
        key: "account",
        header: t("cases.reconciliation.source", "Nguồn"),
        size: 140,
        cell: (row) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName ||
                  t("cases.reconciliation.bank", "Ngân hàng")
                : row.cashBook?.name ||
                  t("cases.reconciliation.cashFund", "Sổ quỹ")}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || "---"
                : t("cases.reconciliation.cash", "Tiền mặt")}
            </span>
          </div>
        ),
      },
      {
        key: "referenceNumber",
        header: t("cases.reconciliation.refNumber", "Tham chiếu"),
        size: 180,
        cell: (row) =>
          row.referenceNumber ? (
            <Tooltip
              content={`${t("cases.reconciliation.refNumber", "Số tham chiếu")}: ${row.referenceNumber}`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row.id);
                }}
                className="font-mono font-semibold text-primary hover:underline cursor-pointer text-xs truncate max-w-full block text-left"
              >
                {row.referenceNumber}
              </button>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          ),
      },
      {
        key: "description",
        header: t("cases.reconciliation.description", "Nội dung"),
        size: 380,
        cell: (row) => (
          <Tooltip content={row.description || "—"}>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate cursor-default max-w-full">
              {row.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "originalAmount",
        header: t("cases.reconciliation.originalAmount", "Số tiền gốc"),
        size: 120,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const isCredit = Number(row.creditAmount || 0) > 0;
          const originalAmount = isCredit
            ? Number(row.creditAmount || 0)
            : Number(row.debitAmount || 0);
          return (
            <span
              className={cn(
                "text-xs font-mono font-semibold tabular-nums",
                isCredit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-[#ea580c] dark:text-orange-400",
              )}
            >
              {isCredit ? `+${money(originalAmount)}` : money(originalAmount)}
            </span>
          );
        },
      },
      {
        key: "netOffAmount",
        header: t("cases.reconciliation.netOffAmount", "Tiền cấn trừ"),
        size: 140,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const netOffVal =
            netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : 0;
          const maxVal = maxAmounts[row.id];
          return (
            <div className="w-full">
              <NetOffInput
                initialValue={netOffVal}
                maxAmount={maxVal}
                onChange={(val) => onAmountChange(row, val)}
              />
            </div>
          );
        },
      },
    ],
    [netOffAmounts, maxAmounts, onAmountChange, onViewDetail, t],
  );

  if (items.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic text-center py-3 px-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
        {t(
          "cases.reconciliation.noSelectedBankTxns",
          "Chưa có giao dịch nào được chọn. Hãy tick chọn các dòng từ bảng danh sách bên dưới hoặc từ gợi ý thông minh.",
        )}
      </div>
    );
  }

  return (
    <StandardTable
      tableId="garage-reconciliation-selected-bank-txns-table"
      items={items}
      columns={columns}
      getRowKey={(row: any) => row.id}
      variant="spreadsheet"
      enableColumnResizing={true}
      enableRowHoverActions={true}
      enableRowContextMenu={true}
      hideLegacyActionColumn={true}
      actions={(row) => [
        {
          label: t(
            "cases.reconciliation.viewTxnDetail",
            "Xem chi tiết giao dịch",
          ),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => onViewDetail(row.id),
        },
        {
          label: t("cases.reconciliation.removeTxn", "Bỏ chọn giao dịch"),
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          variant: "danger",
          onClick: () => onRemove(row),
        },
      ]}
      minWidth={1150}
      containerClassName="max-h-[155px] overflow-y-auto scrollbar-thin"
    />
  );
}
