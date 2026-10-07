import React from "react";
import type { TFunction } from "i18next";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteFinancialItem } from "../../../GarageCasePreview.type";
import type { QuoteReceivableRow } from "./QuoteReceivablesTable.type";

export function renderFinancialGroupBadge(t: TFunction, group: string) {
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

  const g = groupLabels[group] || {
    label: group,
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
}

export function renderFinancialAmount(row: QuoteFinancialItem) {
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
}

export function computeQuoteReceivableRows(
  caseData?: any,
  activeSettlements?: any[],
  propItems?: QuoteReceivableRow[],
  activeLinkedInvoices?: any[],
): QuoteReceivableRow[] {
  if (propItems && propItems.length > 0) {
    return propItems;
  }
  const rawData = caseData?.rawData;
  const khAmount = Number(
    rawData?.TienThanhToanKH ?? caseData?.tienThanhToanKh ?? 0,
  );
  const bhAmount = Number(
    rawData?.TienThanhToanBH ?? caseData?.tienThanhToanBh ?? 0,
  );

  let khCollected = 0;
  let bhCollected = 0;

  const receiptSettlements = (activeSettlements || []).filter((s: any) => {
    const type = s.settlementType || s.settlement_type;
    return type === "RECEIPT";
  });

  if (receiptSettlements.length > 0) {
    receiptSettlements.forEach((s: any) => {
      const amt = Number(s.amount || 0);
      const isBh =
        s.payer === "BH" ||
        /bảo hiểm|bảo việt|pti|pvi|bic|mic|pjico|vbi/i.test(
          `${s.partnerName || ""} ${s.partner_name || ""} ${s.note || ""} ${s.category || ""}`,
        );
      if (isBh) {
        bhCollected += amt;
      } else {
        khCollected += amt;
      }
    });
  } else {
    const kgaraPaid = Number(
      rawData?.TienDaThanhToan ?? caseData?.tienDaThanhToan ?? 0,
    );
    if (kgaraPaid > 0) {
      if (bhAmount <= 0) {
        khCollected = Math.min(khAmount, kgaraPaid);
      } else {
        khCollected = Math.min(khAmount, kgaraPaid);
        bhCollected = Math.max(0, Math.min(bhAmount, kgaraPaid - khCollected));
      }
    }
  }

  const khRemaining = Math.max(0, khAmount - khCollected);
  const bhRemaining = Math.max(0, bhAmount - bhCollected);

  // Phân loại các hóa đơn đầu ra (OUT) đã liên kết
  const khLinkedInvoices: any[] = [];
  const bhLinkedInvoices: any[] = [];

  const outInvoices = (activeLinkedInvoices || []).filter((inv: any) => {
    const linkType = inv.linkType || inv.direction;
    return linkType === "OUT";
  });

  outInvoices.forEach((inv: any) => {
    const buyerStr = `${inv.buyerName || inv.invoice?.buyerName || inv.partnerName || ""} ${inv.note || ""}`;
    const isBh =
      inv.payer === "BH" ||
      inv.isInsurance === true ||
      /bảo hiểm|bảo việt|pti|pvi|bic|mic|pjico|vbi|bhhk|liberty|bảo minh|hàng không/i.test(
        buyerStr,
      );

    const invItem = {
      id: inv.id || inv.invoiceId,
      invoiceId: inv.invoiceId || inv.id,
      invoiceNo: inv.invoiceNo || inv.invoice?.invoiceNo || "---",
      totalAmount: Number(inv.totalAmount || inv.invoice?.totalAmount || 0),
      invoiceDate: inv.invoiceDate || inv.invoice?.invoiceDate,
      buyerName: inv.buyerName || inv.invoice?.buyerName || inv.partnerName,
      sellerName: inv.sellerName || inv.invoice?.sellerName,
      hasBankNetOff: Boolean(
        inv.hasBankNetOff ||
        Number(inv.bankSettledAmount || 0) > 0 ||
        (activeSettlements || []).some(
          (s: any) =>
            (s.sourceChannel === "ON_SYSTEM" ||
              s.source_channel === "ON_SYSTEM") &&
            (s.invoiceId === inv.invoiceId ||
              s.referenceNumber === inv.invoiceNo),
        ),
      ),
      bankSettledAmount: Number(inv.bankSettledAmount || 0),
    };

    if (bhAmount > 0 && isBh) {
      bhLinkedInvoices.push(invItem);
    } else {
      khLinkedInvoices.push(invItem);
    }
  });

  return [
    {
      id: "KH",
      stt: 1,
      payer: "KH",
      labelKey: "cases.quotePreview.fin.customerPayment",
      defaultLabel: "Khách hàng thanh toán",
      amount: khAmount,
      collectedAmount: khCollected,
      remainingAmount: khRemaining,
      linkedInvoices: khLinkedInvoices,
    },
    {
      id: "BH",
      stt: 2,
      payer: "BH",
      labelKey: "cases.quotePreview.fin.insuranceApproved",
      defaultLabel: "Bảo hiểm thanh toán",
      amount: bhAmount,
      collectedAmount: bhCollected,
      remainingAmount: bhRemaining,
      linkedInvoices: bhLinkedInvoices,
    },
  ];
}
