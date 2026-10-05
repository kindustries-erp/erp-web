import React from "react";
import type { TFunction } from "i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { formatNumber } from "../../GarageCasePreview.helper";
import type { QuoteFinancialItem } from "../../GarageCasePreview.type";

export function getQuoteFinancialsTableColumns(
  t: TFunction,
): DataTableColumn<QuoteFinancialItem>[] {
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
      key: "order",
      header: "#",
      size: 45,
      minSize: 45,
      maxSize: 55,
      cell: (row) => (
        <div className="w-full text-center text-xs font-mono text-muted-foreground">
          {row.order}
        </div>
      ),
    },
    {
      key: "group",
      header: t("cases.quotePreview.fin.groupCol", "Nhóm"),
      size: 115,
      cell: (row) => {
        const groupLabels: Record<string, { label: string; cls: string }> = {
          REVENUE: {
            label: t("cases.quotePreview.fin.grpRevenue", "Doanh thu"),
            cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
          },
          DEDUCTION: {
            label: t("cases.quotePreview.fin.grpDeduction", "Giảm trừ"),
            cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
          },
          PAYMENT: {
            label: t("cases.quotePreview.fin.grpPayment", "Thanh toán"),
            cls: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
          },
          COMMISSION: {
            label: t("cases.quotePreview.fin.grpCommission", "Hoa hồng"),
            cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
          },
          PROFIT: {
            label: t("cases.quotePreview.fin.grpProfit", "Lợi nhuận"),
            cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
          },
        };
        const g = groupLabels[row.group] || {
          label: row.group,
          cls: "bg-slate-50 text-slate-700 border-slate-200",
        };
        return (
          <div className="w-full flex justify-center">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${g.cls}`}
            >
              {g.label}
            </span>
          </div>
        );
      },
    },
    {
      key: "label",
      header: t("cases.quotePreview.fin.itemCol", "Khoản mục tài chính"),
      size: 260,
      cell: (row) => (
        <TableText
          text={t(row.labelKey, row.defaultLabel)}
          className={
            row.tone === "primary" ? "font-bold text-primary" : undefined
          }
        />
      ),
    },
    {
      key: "rate",
      header: t("cases.quotePreview.fin.rateCol", "Tỷ lệ %"),
      size: 80,
      cell: (row) => (
        <div className="w-full text-right text-xs font-mono tabular-nums text-muted-foreground">
          {row.rate != null && Number(row.rate) > 0 ? `${row.rate}%` : "---"}
        </div>
      ),
    },
    {
      key: "amount",
      header: t("cases.quotePreview.fin.amountCol", "Số tiền (VND)"),
      size: 150,
      cell: (row) => {
        const toneCls =
          row.tone === "primary"
            ? "font-bold text-primary text-sm"
            : row.tone === "success"
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : row.tone === "danger"
                ? "font-semibold text-rose-600 dark:text-rose-400"
                : row.tone === "warning"
                  ? "font-semibold text-amber-600 dark:text-amber-400"
                  : row.tone === "muted"
                    ? "text-slate-500 font-normal"
                    : "font-semibold text-slate-900 dark:text-slate-100";
        return (
          <div
            className={`w-full text-right font-mono tabular-nums text-xs ${toneCls}`}
          >
            {formatNumber(row.amount)} ₫
          </div>
        );
      },
    },
    {
      key: "payer",
      header: t("cases.quotePreview.fin.payerCol", "Bên chịu phí / thanh toán"),
      size: 140,
      cell: (row) => {
        if (row.payer === "KH") {
          return (
            <div className="w-full flex justify-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                {t("cases.quotePreview.fin.payerKH", "Khách hàng")}
              </span>
            </div>
          );
        }
        if (row.payer === "BH") {
          return (
            <div className="w-full flex justify-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                {t("cases.quotePreview.fin.payerBH", "Bảo hiểm")}
              </span>
            </div>
          );
        }
        if (row.payer === "GARAGE") {
          return (
            <div className="w-full flex justify-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-800">
                {t("cases.quotePreview.fin.payerGarage", "Garage")}
              </span>
            </div>
          );
        }
        return (
          <div className="w-full text-center text-xs text-muted-foreground">
            ---
          </div>
        );
      },
    },
  ];
}
