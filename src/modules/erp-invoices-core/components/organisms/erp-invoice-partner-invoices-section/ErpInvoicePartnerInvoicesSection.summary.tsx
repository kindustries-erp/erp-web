import React from "react";
import type { TFunction } from "i18next";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";

export interface BuildSummaryRowOptions {
  t: TFunction;
  paginatedInvoices: PartnerInvoiceDetailItem[];
  cumulativeItems: PartnerInvoiceDetailItem[];
  filteredInvoices: PartnerInvoiceDetailItem[];
  totalItems: number;
  page: number;
  totalPages: number;
}

function calculateInvoiceSums(items: PartnerInvoiceDetailItem[]) {
  let preVat = 0;
  let vat = 0;
  let total = 0;
  let paid = 0;
  let bal = 0;
  let a0_30 = 0;
  let a31_60 = 0;
  let a61_90 = 0;
  let aOver90 = 0;

  for (const inv of items) {
    const curBal = Number(inv.balanceAmount) || 0;
    const aging = Number(inv.agingDays) || 0;

    preVat += Number(inv.preVatAmount) || 0;
    vat += Number(inv.vatAmount) || 0;
    total += Number(inv.totalAmount) || 0;
    paid += Number(inv.paidAmount) || 0;
    bal += curBal;

    if (curBal > 0) {
      if (aging <= 30) a0_30 += curBal;
      else if (aging <= 60) a31_60 += curBal;
      else if (aging <= 90) a61_90 += curBal;
      else aOver90 += curBal;
    }
  }

  return { preVat, vat, total, paid, bal, a0_30, a31_60, a61_90, aOver90 };
}

export function buildPartnerInvoiceSummaryRow({
  t,
  paginatedInvoices,
  cumulativeItems,
  filteredInvoices,
  totalItems,
  page,
  totalPages,
}: BuildSummaryRowOptions) {
  if (!filteredInvoices || filteredInvoices.length === 0) return undefined;

  const sub = calculateInvoiceSums(paginatedInvoices);
  const cum = calculateInvoiceSums(cumulativeItems);
  const grand = calculateInvoiceSums(filteredInvoices);
  const cumCount = cumulativeItems.length;
  const currentCount = paginatedInvoices.length;

  return {
    invoiceDate: (
      <SubtotalSummaryCell
        variantType="label"
        label={`${t("total", "Tổng cộng")}:`}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
      />
    ),
    preVatAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("preVatAmount", "Tiền trước thuế")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.preVat}
        cumulativeAmount={cum.preVat}
        grandTotalAmount={grand.preVat}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-muted-foreground font-semibold"
      />
    ),
    vatAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("vatAmount", "Tiền thuế VAT")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.vat}
        cumulativeAmount={cum.vat}
        grandTotalAmount={grand.vat}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-muted-foreground font-semibold"
      />
    ),
    totalAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("totalAmount", "Tổng giá trị hóa đơn")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.total}
        cumulativeAmount={cum.total}
        grandTotalAmount={grand.total}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-foreground font-bold"
      />
    ),
    paidAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("paidAmount", "Đã thanh toán / Cấn trừ")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.paid}
        cumulativeAmount={cum.paid}
        grandTotalAmount={grand.paid}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
      />
    ),
    balanceAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("balanceAmount", "Tổng nợ còn lại")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.bal}
        cumulativeAmount={cum.bal}
        grandTotalAmount={grand.bal}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName={
          sub.bal === 0
            ? "text-emerald-600 dark:text-emerald-400 font-bold"
            : "text-destructive font-bold"
        }
      />
    ),
    aging0To30: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("aging0_30", "0-30 ngày")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.a0_30}
        cumulativeAmount={cum.a0_30}
        grandTotalAmount={grand.a0_30}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-emerald-700 dark:text-emerald-400 font-bold"
      />
    ),
    aging31To60: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("aging31_60", "31-60 ngày")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.a31_60}
        cumulativeAmount={cum.a31_60}
        grandTotalAmount={grand.a31_60}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-amber-800 dark:text-amber-300 font-bold"
      />
    ),
    aging61To90: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("aging61_90", "61-90 ngày")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.a61_90}
        cumulativeAmount={cum.a61_90}
        grandTotalAmount={grand.a61_90}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-orange-700 dark:text-orange-400 font-bold"
      />
    ),
    agingOver90: (
      <SubtotalSummaryCell
        variantType="amount"
        metricTitle={t("agingOver90", ">90 ngày")}
        itemTitle={t("recordsInvoices", "hóa đơn")}
        subtotalAmount={sub.aOver90}
        cumulativeAmount={cum.aOver90}
        grandTotalAmount={grand.aOver90}
        page={page}
        totalPages={totalPages}
        currentPageCount={currentCount}
        totalCount={totalItems}
        cumulativeCount={cumCount}
        valueClassName="text-rose-700 dark:text-rose-400 font-bold"
      />
    ),
  };
}
