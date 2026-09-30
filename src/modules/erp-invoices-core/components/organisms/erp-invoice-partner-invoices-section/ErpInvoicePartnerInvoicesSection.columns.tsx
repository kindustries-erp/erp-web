import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";

export interface BuildColumnsOptions {
  t: TFunction;
  headerFilter: any;
  onPreviewInvoice?: (invoice: PartnerInvoiceDetailItem) => void;
}

export function buildPartnerInvoiceColumns({
  t,
  headerFilter,
  onPreviewInvoice,
}: BuildColumnsOptions): DataTableColumn<PartnerInvoiceDetailItem>[] {
  return [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      minSize: 40,
      enableResizing: false,
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      cell: (_, idx) => (
        <span className="w-full block text-center font-medium">{idx}</span>
      ),
    },
    {
      key: "invoiceNo",
      header: headerFilter("invoiceNo", t("invoiceNo", "Số HĐ")),
      size: 140,
      minSize: 120,
      enableResizing: true,
      cell: (row) => (
        <div
          className="flex items-center gap-1 w-full min-w-0"
          onClick={() => onPreviewInvoice?.(row)}
        >
          <TableText
            text={row.invoiceNo || "N/A"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            textClassName="cursor-pointer hover:underline"
            onDetailClick={(e) => {
              e?.stopPropagation();
              onPreviewInvoice?.(row);
            }}
          />
        </div>
      ),
    },
    {
      key: "serialNo",
      header: headerFilter("serialNo", t("serialNo", "Ký hiệu")),
      size: 100,
      minSize: 85,
      enableResizing: true,
      className: "text-left font-mono text-xs text-muted-foreground",
      cell: (row) => row.serialNo || "—",
    },
    {
      key: "invoiceDate",
      className: "text-right",
      header: headerFilter.date("invoiceDate", t("invoiceDate", "Ngày HĐ")),
      size: 115,
      minSize: 100,
      enableResizing: true,
      cell: (row) => (
        <TableDateCell
          date={row.invoiceDate}
          format="date"
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "description",
      size: 200,
      minSize: 200,
      enableResizing: true,
      headerClassName: "w-[200px] min-w-[200px] max-w-[200px] text-left",
      className: "w-[200px] min-w-[200px] max-w-[200px] text-left",
      header: headerFilter("description", t("description", "Diễn giải")),
      cell: (row) => (
        <Tooltip content={row.description || ""}>
          <div className="truncate w-full max-w-[200px] text-xs text-muted-foreground">
            {row.description || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      key: "preVatAmount",
      className:
        "text-right tabular-nums font-mono text-xs text-muted-foreground",
      header: headerFilter.amount(
        "preVatAmount",
        t("preVatAmount", "Trước thuế"),
      ),
      size: 125,
      minSize: 110,
      enableResizing: true,
      cell: (row) => money(row.preVatAmount),
    },
    {
      key: "vatAmount",
      className:
        "text-right tabular-nums font-mono text-xs text-muted-foreground",
      header: headerFilter.amount("vatAmount", t("vatAmount", "Tiền thuế")),
      size: 115,
      minSize: 100,
      enableResizing: true,
      cell: (row) => money(row.vatAmount),
    },
    {
      key: "totalAmount",
      className:
        "text-right tabular-nums font-mono font-semibold text-xs text-foreground",
      header: headerFilter.amount("totalAmount", t("totalAmount", "Tổng tiền")),
      size: 135,
      minSize: 120,
      enableResizing: true,
      cell: (row) => money(row.totalAmount),
    },
    {
      key: "paidAmount",
      className:
        "text-right tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400",
      header: headerFilter.amount("paidAmount", t("paidAmount", "Đã cấn trừ")),
      size: 130,
      minSize: 115,
      enableResizing: true,
      cell: (row) => money(row.paidAmount),
    },
    {
      key: "balanceAmount",
      className: "text-right tabular-nums font-mono text-xs",
      header: headerFilter.amount(
        "balanceAmount",
        t("balanceAmount", "Còn nợ"),
      ),
      size: 135,
      minSize: 120,
      enableResizing: true,
      cell: (row) => (
        <span
          className={cn(
            "tabular-nums font-mono font-bold text-xs",
            row.balanceAmount > 0
              ? "text-destructive"
              : "text-muted-foreground font-normal",
          )}
        >
          {money(row.balanceAmount)}
        </span>
      ),
    },
    {
      key: "aging0To30",
      className:
        "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
      headerClassName:
        "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
      header: headerFilter.amount("aging0To30", t("aging0_30", "0-30 ngày")),
      size: 130,
      minSize: 115,
      enableResizing: true,
      cell: (row) => {
        const val =
          row.balanceAmount > 0 && row.agingDays <= 30 ? row.balanceAmount : 0;
        if (val <= 0) {
          return (
            <span className="text-muted-foreground/30 font-normal select-none">
              —
            </span>
          );
        }
        return (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "aging31To60",
      className:
        "text-right bg-amber-50/40 dark:bg-amber-950/20 font-mono text-xs",
      headerClassName:
        "bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-right justify-end",
      header: headerFilter.amount("aging31To60", t("aging31_60", "31-60 ngày")),
      size: 130,
      minSize: 115,
      enableResizing: true,
      cell: (row) => {
        const val =
          row.balanceAmount > 0 && row.agingDays > 30 && row.agingDays <= 60
            ? row.balanceAmount
            : 0;
        if (val <= 0) {
          return (
            <span className="text-muted-foreground/30 font-normal select-none">
              —
            </span>
          );
        }
        return (
          <span className="font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "aging61To90",
      className:
        "text-right bg-orange-50/40 dark:bg-orange-950/20 font-mono text-xs",
      headerClassName:
        "bg-orange-50/80 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-semibold text-right justify-end",
      header: headerFilter.amount("aging61To90", t("aging61_90", "61-90 ngày")),
      size: 130,
      minSize: 115,
      enableResizing: true,
      cell: (row) => {
        const val =
          row.balanceAmount > 0 && row.agingDays > 60 && row.agingDays <= 90
            ? row.balanceAmount
            : 0;
        if (val <= 0) {
          return (
            <span className="text-muted-foreground/30 font-normal select-none">
              —
            </span>
          );
        }
        return (
          <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "agingOver90",
      className:
        "text-right bg-rose-50/40 dark:bg-rose-950/20 font-mono text-xs",
      headerClassName:
        "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold text-right justify-end",
      header: headerFilter.amount("agingOver90", t("agingOver90", ">90 ngày")),
      size: 135,
      minSize: 120,
      enableResizing: true,
      cell: (row) => {
        const val =
          row.balanceAmount > 0 && row.agingDays > 90 ? row.balanceAmount : 0;
        if (val <= 0) {
          return (
            <span className="text-muted-foreground/30 font-normal select-none">
              —
            </span>
          );
        }
        return (
          <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "agingDays",
      className: "text-center",
      header: headerFilter.numeric("agingDays", t("agingDays", "Tuổi nợ")),
      size: 105,
      minSize: 95,
      enableResizing: true,
      cell: (row) => {
        if (row.balanceAmount <= 0) {
          return (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-normal"
            >
              {t("settled", "Đã tất toán")}
            </Badge>
          );
        }
        const tagCls =
          row.agingDays > 90
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : row.agingDays > 60
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : row.agingDays > 30
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 font-mono font-medium",
              tagCls,
            )}
          >
            {row.agingDays} {t("unitDays", "ngày")}
          </Badge>
        );
      },
    },
    {
      key: "status",
      className: "text-center",
      header: headerFilter.client("status", t("status", "Trạng thái"), {
        filterOptions: [
          { label: t("confirmed", "Đã xác nhận"), value: "CONFIRMED" },
          { label: t("draft", "Nháp"), value: "DRAFT" },
          { label: t("cancelled", "Đã hủy"), value: "CANCELLED" },
        ],
      }),
      size: 110,
      minSize: 100,
      enableResizing: true,
      cell: (row) => (
        <Badge
          variant={
            row.status === "CONFIRMED"
              ? "default"
              : row.status === "CANCELLED"
                ? "destructive"
                : "secondary"
          }
          className="w-[85px] inline-flex items-center justify-center text-center truncate text-[10px]"
        >
          {row.status === "CONFIRMED"
            ? t("confirmed", "Đã xác nhận")
            : row.status === "CANCELLED"
              ? t("cancelled", "Đã hủy")
              : t("draft", "Nháp")}
        </Badge>
      ),
    },
  ];
}
