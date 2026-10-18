import React from "react";
import type { TFunction } from "i18next";
import { Banknote, Wrench } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteCostTableRow } from "./QuoteCostSummarySection.type";

export function getQuoteCostTableColumns(
  t: TFunction,
  onPaymentClick: () => void,
  canPerformPayment: boolean,
  disabledReason?: string,
): DataTableColumn<QuoteCostTableRow>[] {
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
      cell: () => (
        <div className="w-full flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("cases.financials.vendorAndLabor", "NCC & Thợ")}</span>
          </span>
        </div>
      ),
    },
    {
      key: "label",
      header: t("cases.financials.costItemCol", "Khoản mục chi phí"),
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
      header: t("cases.financials.targetCostCol", "Số tiền (VND)"),
      size: 150,
      cell: (row) => (
        <div className="w-full text-right font-mono tabular-nums font-bold text-xs text-foreground">
          {formatNumber(row.amount)} ₫
        </div>
      ),
    },
    {
      key: "paidAmount",
      header: t("cases.financials.paidCostCol", "Đã chi"),
      size: 140,
      cell: (row) => (
        <div className="w-full text-right font-mono tabular-nums font-bold text-xs text-emerald-600 dark:text-emerald-400">
          {formatNumber(row.paidAmount)} ₫
        </div>
      ),
    },
    {
      key: "remainingAmount",
      header: t("cases.financials.remainingCostCol", "Còn lại"),
      size: 140,
      cell: (row) => (
        <div
          className={`w-full text-right font-mono tabular-nums font-bold text-xs ${
            row.remainingAmount <= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {formatNumber(row.remainingAmount)} ₫
        </div>
      ),
    },
    {
      key: "linkedInvoices",
      header: t("cases.quotePreview.fin.linkedInvoicesCol", "HĐ đã cấn trừ"),
      size: 180,
      minSize: 150,
      cell: (row) => {
        const invoices = row.linkedInvoices || [];
        if (invoices.length === 0) {
          return (
            <div className="w-full text-center text-xs text-muted-foreground">
              —
            </div>
          );
        }

        return (
          <div className="w-full flex flex-wrap items-center gap-1.5 py-0.5">
            {invoices.map((inv, i) => {
              const isSettled = Boolean(
                inv.hasBankNetOff || (inv.bankSettledAmount || 0) > 0,
              );
              const badgeClass = isSettled
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
              const tooltipText = `${inv.invoiceNo} • ${formatNumber(inv.totalAmount || 0)} ₫ • ${
                isSettled ? "Đã khớp sao kê" : "Chưa khớp sao kê"
              }${inv.sellerName ? ` • ${inv.sellerName}` : ""}`;

              return (
                <Tooltip
                  key={inv.id || inv.invoiceId || i}
                  content={tooltipText}
                  side="top"
                >
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border ${badgeClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSettled ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <span>#{inv.invoiceNo}</span>
                  </span>
                </Tooltip>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: t("cases.quotePreview.paymentCol", "Thanh toán / Chi tiền"),
      size: 140,
      cell: () => {
        const btnContent = (
          <button
            type="button"
            disabled={!canPerformPayment}
            onClick={(e) => {
              e.stopPropagation();
              if (canPerformPayment) {
                onPaymentClick();
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold border transition-colors ${
              canPerformPayment
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50 cursor-pointer"
                : "bg-amber-50 text-amber-700 border-amber-200 opacity-60 cursor-not-allowed pointer-events-none dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("cases.financials.payCostBtn", "Chi tiền")}</span>
          </button>
        );

        if (!canPerformPayment && disabledReason) {
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={disabledReason} side="top">
                <span className="inline-flex cursor-not-allowed">
                  {btnContent}
                </span>
              </Tooltip>
            </div>
          );
        }

        return <div className="w-full flex justify-center">{btnContent}</div>;
      },
    },
  ];
}
