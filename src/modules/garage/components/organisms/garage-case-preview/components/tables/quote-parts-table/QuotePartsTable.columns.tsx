import React from "react";
import type { TFunction } from "i18next";
import { ArrowUpRight } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export function getQuotePartsTableColumns(
  t: TFunction,
  onPaymentClick?: (line: QuoteLineItem) => void,
  canEditFinancial: boolean = true,
): DataTableColumn<QuoteLineItem>[] {
  return [
    {
      key: "stt",
      header: t("cases.quotePreview.stt", "STT"),
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: (_row, idx) => (
        <div className="w-full text-center text-xs font-medium text-muted-foreground tabular-nums">
          {idx}
        </div>
      ),
    },
    {
      key: "itemType",
      header: t("cases.quotePreview.typeCol", "Loại"),
      size: 65,
      minSize: 60,
      maxSize: 80,
      cell: () => (
        <div className="w-full flex justify-center">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            {t("cases.quotePreview.typePart", "Vật tư")}
          </span>
        </div>
      ),
    },
    {
      key: "code",
      header: t("cases.quotePreview.partCode", "Mã PT"),
      size: 110,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: t("cases.quotePreview.partName", "Tên phụ tùng"),
      size: 230,
      cell: (row) => <TableText text={row.name} />,
    },
    {
      key: "quantity",
      header: t("cases.quotePreview.qty", "SL"),
      size: 55,
      cell: (row) => (
        <div className="w-full text-right font-medium tabular-nums text-xs">
          {formatNumber(row.quantity)}
        </div>
      ),
    },
    {
      key: "unitPrice",
      header: t("cases.quotePreview.unitPrice", "Đơn giá"),
      size: 90,
      cell: (row) => (
        <div className="w-full text-right tabular-nums text-xs">
          {formatNumber(row.unitPrice)}
        </div>
      ),
    },
    {
      key: "discountRate",
      header: t("cases.quotePreview.discount", "%GG"),
      size: 55,
      cell: (row) => (
        <div className="w-full text-right text-xs text-muted-foreground tabular-nums">
          {formatNumber(row.discountRate)}%
        </div>
      ),
    },
    {
      key: "amount",
      header: t("cases.quotePreview.amount", "Thành tiền"),
      size: 110,
      cell: (row) => (
        <div className="w-full text-right font-semibold tabular-nums text-xs text-slate-900 dark:text-slate-100">
          {formatNumber(row.amount)}
        </div>
      ),
    },
    {
      key: "taxRate",
      header: t("cases.quotePreview.tax", "Thuế"),
      size: 55,
      cell: (row) => (
        <div className="w-full text-right text-xs text-muted-foreground tabular-nums">
          {formatNumber(row.taxRate)}%
        </div>
      ),
    },
    {
      key: "unitCost",
      header: t("cases.quotePreview.unitCost", "ĐG vốn"),
      size: 90,
      cell: (row) => (
        <div className="w-full text-right tabular-nums text-xs text-slate-600 dark:text-slate-400">
          {formatNumber(row.unitCost)}
        </div>
      ),
    },
    {
      key: "totalCost",
      header: t("cases.quotePreview.totalCost", "Tổng vốn"),
      size: 105,
      cell: (row) => (
        <div className="w-full text-right font-medium tabular-nums text-xs text-slate-700 dark:text-slate-300">
          {formatNumber(row.totalCost)}
        </div>
      ),
    },
    {
      key: "technicianName",
      header: t("cases.quotePreview.technician", "Kỹ thuật viên"),
      size: 120,
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
          {row.technicianName || "---"}
        </span>
      ),
    },
    {
      key: "insurance",
      header: t("cases.quotePreview.insuranceCol", "Bảo hiểm"),
      size: 90,
      cell: (row) => (
        <div className="w-full flex justify-center">
          {row.isInsurance ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {row.insuranceApprovedAmount && row.insuranceApprovedAmount > 0
                ? `${formatNumber(row.insuranceApprovedAmount)} ₫`
                : t("cases.quotePreview.insuranceApproved", "BH duyệt")}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">---</span>
          )}
        </div>
      ),
    },
    {
      key: "payment",
      header: t("cases.quotePreview.costPaymentCol", "Cấn trừ chi"),
      size: 110,
      cell: (row) => {
        if (!canEditFinancial) {
          return (
            <div className="w-full flex justify-center text-xs text-muted-foreground">
              ---
            </div>
          );
        }
        return (
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPaymentClick?.(row);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{t("cases.quotePreview.payCost", "Chi tiền")}</span>
            </button>
          </div>
        );
      },
    },
  ];
}
