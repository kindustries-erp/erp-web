import React, { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Eye, Trash2 } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { SelectedInvoicesTableProps } from "../types";

export function SelectedInvoicesTable({
  invoices,
  onRemove,
  onViewDetail,
}: SelectedInvoicesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const columns: DataTableColumn<ErpInvoice>[] = useMemo(
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
        key: "invoiceNo",
        header: t("cases.reconciliation.invoiceNoAndSerial", "Số & Ký hiệu HĐ"),
        size: 180,
        cell: (inv) => (
          <Tooltip
            content={`${t("cases.reconciliation.invoiceNo", "Hóa đơn")}: #${inv.invoiceNo || inv.id?.slice(0, 8)}${
              inv.serialNo
                ? ` (${t("cases.reconciliation.serialNo", "Ký hiệu")}: ${inv.serialNo})`
                : ""
            }`}
          >
            <div className="flex items-center gap-1 font-mono text-xs truncate max-w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(inv.id);
                }}
                className="font-semibold text-primary hover:underline cursor-pointer truncate"
              >
                #{inv.invoiceNo || inv.id?.slice(0, 8)}
              </button>
              {inv.serialNo && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  ({inv.serialNo})
                </span>
              )}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "invoiceDate",
        header: t("cases.reconciliation.invoiceDate", "Ngày phát hành"),
        size: 100,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (inv) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
            : "—",
      },
      {
        key: "partnerName",
        header: t("cases.reconciliation.partner", "Đối tác"),
        size: 160,
        cell: (inv) => {
          const partnerName = inv.sellerName || inv.buyerName || "—";
          return (
            <Tooltip content={partnerName || "—"}>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block max-w-[160px] cursor-default">
                {partnerName}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "description",
        header: t("cases.reconciliation.description", "Nội dung"),
        size: 380,
        cell: (inv) => (
          <Tooltip content={inv.description || "—"}>
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate block max-w-full cursor-default">
              {inv.description || "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "totalAmount",
        header: t("cases.reconciliation.totalVatAmount", "Tổng tiền VAT"),
        size: 130,
        headerClassName: "text-right",
        className: "text-right",
        cell: (inv) => (
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
            {money(inv.totalAmount || 0)}
          </span>
        ),
      },
    ],
    [onViewDetail, t],
  );

  if (invoices.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic text-center py-3 px-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
        {t(
          "cases.reconciliation.noSelectedInvoices",
          "Chưa có hóa đơn nào được chọn. Hãy tick chọn các dòng từ bảng danh sách bên dưới hoặc từ gợi ý thông minh.",
        )}
      </div>
    );
  }

  return (
    <StandardTable
      tableId="garage-reconciliation-selected-invoices-table"
      items={invoices}
      columns={columns}
      getRowKey={(inv: ErpInvoice) => inv.id}
      variant="spreadsheet"
      enableColumnResizing={true}
      enableRowHoverActions={true}
      enableRowContextMenu={true}
      hideLegacyActionColumn={true}
      actions={(inv) => [
        {
          label: t(
            "cases.reconciliation.viewInvoiceDetail",
            "Xem chi tiết hóa đơn",
          ),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => onViewDetail(inv.id),
        },
        {
          label: t("cases.reconciliation.removeInvoice", "Bỏ chọn hóa đơn"),
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          variant: "danger",
          onClick: () => onRemove(inv),
        },
      ]}
      minWidth={1050}
      containerClassName="max-h-[155px] overflow-y-auto scrollbar-thin"
    />
  );
}
