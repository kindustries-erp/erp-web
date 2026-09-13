import { useMemo } from "react";
import { format } from "date-fns";
import { Trash2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { NetOffInput } from "./NetOffInput";
import { type SelectedVoucherItem } from "../types";

interface SelectedBankTransactionsTableProps {
  items: SelectedVoucherItem[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  invoiceDirection?: "IN" | "OUT";
  onAmountChange: (txn: any, val: number) => void;
  onRemove: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export function SelectedBankTransactionsTable({
  items,
  netOffAmounts,
  maxAmounts,
  invoiceDirection,
  onAmountChange,
  onRemove,
  onViewDetail,
}: SelectedBankTransactionsTableProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  const columns: DataTableColumn<SelectedVoucherItem>[] = useMemo(
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
        header: t("selectedBankTable.colTransDate", "Ngày GD"),
        size: 95,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row) =>
          row.txn.transDate
            ? format(new Date(row.txn.transDate), "dd/MM/yyyy")
            : "—",
      },
      {
        key: "account",
        header: t("selectedBankTable.colSource", "Nguồn"),
        size: 130,
        cell: (row) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.txn.sourceType === "BANK"
                ? row.txn.bankAccount?.bankName ||
                  row.txn.bankName ||
                  t("selectedBankTable.sourceBank", "Ngân hàng")
                : row.txn.cashBook?.name ||
                  t("selectedBankTable.sourceCash", "Sổ quỹ")}
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono truncate">
              {row.txn.sourceType === "BANK"
                ? row.txn.bankAccount?.accountNumber ||
                  row.txn.accountNumber ||
                  ""
                : t("selectedBankTable.cash", "Tiền mặt")}
            </span>
          </div>
        ),
      },
      {
        key: "referenceNumber",
        header: t("selectedBankTable.colRef", "Tham chiếu"),
        size: 180,
        cell: (row) =>
          row.txn.referenceNumber ? (
            <Tooltip
              content={t("selectedBankTable.tooltipRef", {
                ref: row.txn.referenceNumber,
                defaultValue: `Số tham chiếu: ${row.txn.referenceNumber}`,
              })}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row.id);
                }}
                className="font-mono font-semibold text-primary hover:underline cursor-pointer text-xs truncate max-w-full block text-left"
              >
                {row.txn.referenceNumber}
              </button>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          ),
      },
      {
        key: "partnerName",
        header: t("selectedBankTable.colPartner", "Đối tác"),
        size: 180,
        cell: (row) => {
          const name = row.txn.partnerName || row.txn.correspondentName;
          return name ? (
            <Tooltip content={name}>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-full">
                {name}
              </div>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "description",
        header: t("selectedBankTable.colDescription", "Nội dung"),
        size: 300,
        cell: (row) => (
          <Tooltip content={row.txn.description || "—"}>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate cursor-default max-w-full">
              {row.txn.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "originalAmount",
        header: t("selectedBankTable.colOriginalAmount", "Số tiền gốc"),
        size: 140,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const debit = parseFloat(row.txn.debitAmount) || 0;
          const credit = parseFloat(row.txn.creditAmount) || 0;
          const isDebit = debit > 0;
          const amount = isDebit ? debit : credit;

          // Phân loại tính chất giao dịch
          let natureLabel = isDebit
            ? t("selectedBankTable.natureDebit", "Chi tiền")
            : t("selectedBankTable.natureCredit", "Thu tiền");
          if (invoiceDirection === "IN") {
            natureLabel = isDebit
              ? t("selectedBankTable.natureInDebit", "Chi tiền NCC")
              : t("selectedBankTable.natureInCredit", "NCC hoàn tiền");
          } else if (invoiceDirection === "OUT") {
            natureLabel = isDebit
              ? t("selectedBankTable.natureOutDebit", "Hoàn trả khách")
              : t("selectedBankTable.natureOutCredit", "Thu tiền khách");
          }

          return (
            <div className="flex flex-col items-end leading-tight gap-0.5">
              <span
                className={cn(
                  "font-mono font-bold text-xs",
                  isDebit
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-800 dark:text-slate-200",
                )}
              >
                {isDebit ? "-" : "+"}
                {money(amount)}
              </span>
              <span className="w-[105px] text-center inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                {natureLabel}
              </span>
            </div>
          );
        },
      },
      {
        key: "netOffAmount",
        header: t("selectedBankTable.colNetOffAmount", "Đã cấn trừ"),
        size: 110,
        headerClassName: "text-right",
        className: "text-right font-mono text-xs text-muted-foreground",
        cell: (row) => {
          const val = parseFloat(row.txn.netOffAmount) || 0;
          return val > 0 ? money(val) : "—";
        },
      },
      {
        key: "thisNetOff",
        header: t("selectedBankTable.colThisNetOff", "Cấn trừ đợt này"),
        size: 150,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const netOffVal =
            netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : 0;
          const maxVal = maxAmounts[row.id] || 0;
          return (
            <div className="w-full">
              <NetOffInput
                initialValue={netOffVal}
                maxAmount={maxVal}
                onChange={(val) => onAmountChange(row.txn, val)}
              />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "",
        size: 60,
        headerClassName: "text-center",
        className: "text-center",
        enableResizing: false,
        cell: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(row.id);
              }}
              title={t(
                "selectedBankTable.tooltipDetail",
                "Xem chi tiết giao dịch",
              )}
              className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(row.id);
              }}
              title={t(
                "selectedBankTable.tooltipRemove",
                "Bỏ chọn giao dịch này",
              )}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [
      t,
      netOffAmounts,
      maxAmounts,
      invoiceDirection,
      onAmountChange,
      onRemove,
      onViewDetail,
    ],
  );

  if (items.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic text-center py-3.5 px-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
        {t(
          "selectedBankTable.noSelection",
          "Chưa có giao dịch nào được chọn. Hãy tick chọn các dòng từ bảng danh sách bên dưới hoặc từ gợi ý thông minh.",
        )}
      </div>
    );
  }

  return (
    <StandardTable
      tableId="invoice-selected-bank-txns-table"
      items={items}
      columns={columns}
      getRowKey={(row) => row.id}
      variant="spreadsheet"
      enableColumnResizing={true}
      minWidth={1150}
    />
  );
}
