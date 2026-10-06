import React from "react";
import type { TFunction } from "i18next";
import { UserCheck, ShieldCheck } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteReceivableRow } from "./QuoteReceivablesTable.type";

export function getQuoteReceivablesTableColumns(
  t: TFunction,
  onPaymentClick?: (row: QuoteReceivableRow) => void,
  canEditFinancial: boolean = true,
): DataTableColumn<QuoteReceivableRow>[] {
  return [
    {
      key: "stt",
      header: t("cases.quotePreview.stt", "STT"),
      size: 50,
      minSize: 45,
      maxSize: 55,
      cell: (_row, idx) => (
        <div className="w-full text-center text-xs font-medium text-muted-foreground tabular-nums">
          {idx}
        </div>
      ),
    },
    {
      key: "payer",
      header: t("cases.quotePreview.fin.payerCol", "Đối tượng"),
      size: 150,
      cell: (row) => {
        if (row.payer === "BH") {
          return (
            <div className="w-full flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t("cases.quotePreview.fin.payerBH", "Bảo hiểm")}</span>
              </span>
            </div>
          );
        }
        return (
          <div className="w-full flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("cases.quotePreview.fin.payerKH", "Khách hàng")}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "label",
      header: t("cases.quotePreview.fin.itemCol", "Khoản mục phải thu"),
      size: 280,
      cell: (row) => (
        <TableText
          text={t(row.labelKey, row.defaultLabel)}
          className="font-medium text-foreground text-xs"
        />
      ),
    },
    {
      key: "amount",
      header: t("cases.quotePreview.fin.amountCol", "Số tiền phải thu (VND)"),
      size: 180,
      cell: (row) => (
        <div className="w-full text-right font-mono tabular-nums font-bold text-xs text-foreground">
          {formatNumber(row.amount)} ₫
        </div>
      ),
    },
    {
      key: "actions",
      header: t("cases.quotePreview.paymentCol", "Thanh toán / Thu tiền"),
      size: 140,
      cell: (row) => {
        if (!canEditFinancial) {
          return (
            <div className="w-full flex justify-center text-xs text-muted-foreground">
              ---
            </div>
          );
        }
        if (row.payer === "BH") {
          return (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPaymentClick?.(row);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t("cases.quotePreview.payBH", "Thu BH")}</span>
              </button>
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("cases.quotePreview.payKH", "Thu KH")}</span>
            </button>
          </div>
        );
      },
    },
  ];
}
